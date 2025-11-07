import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Clock, Send, Loader2 } from 'lucide-react';
import type { BuyerPOGroup, PWNIDCompletionStats, SendToERPResult, ERPResponse } from '@/types/automations';
import { isValidPWNID, parsePWNIDInput } from '@/utils/packingListGrouping';
import { toast } from 'sonner';

interface PackingListPWNIDPanelProps {
  groups: BuyerPOGroup[];
  stats: PWNIDCompletionStats;
  onUpdatePWNID: (buyerPONumber: string, pwnid: number | null) => void;
  onSendToERP: () => Promise<SendToERPResult>;
  onERPResponseReceived?: (response: ERPResponse) => void;
  isAutoSaving?: boolean;
  isSendingToERP?: boolean;
  lastSaved?: Date | null;
}

export function PackingListPWNIDPanel({
  groups,
  stats,
  onUpdatePWNID,
  onSendToERP,
  onERPResponseReceived,
  isAutoSaving = false,
  isSendingToERP = false,
  lastSaved
}: PackingListPWNIDPanelProps) {
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [inputErrors, setInputErrors] = useState<{ [key: string]: string }>({});
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Inicializar valores de input desde los grupos
  useEffect(() => {
    const initialValues: { [key: string]: string } = {};
    groups.forEach(group => {
      if (group.PWNID !== null) {
        initialValues[group.buyerPONumber] = String(group.PWNID);
      }
    });
    setInputValues(initialValues);
  }, [groups]);

  const handleInputChange = (buyerPONumber: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [buyerPONumber]: value
    }));

    // Validar en tiempo real
    if (value.trim() === '') {
      setInputErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[buyerPONumber];
        return newErrors;
      });
      onUpdatePWNID(buyerPONumber, null);
      return;
    }

    const parsed = parsePWNIDInput(value);
    if (parsed === null && value.trim() !== '') {
      setInputErrors(prev => ({
        ...prev,
        [buyerPONumber]: 'Debe ser un número entero positivo'
      }));
    } else {
      setInputErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[buyerPONumber];
        return newErrors;
      });
      onUpdatePWNID(buyerPONumber, parsed);
    }
  };

  const handleKeyDown = (buyerPONumber: string, event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      // Encontrar el siguiente input
      const currentIndex = groups.findIndex(g => g.buyerPONumber === buyerPONumber);
      if (currentIndex >= 0 && currentIndex < groups.length - 1) {
        const nextGroup = groups[currentIndex + 1];
        const nextInput = inputRefs.current[nextGroup.buyerPONumber];
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }
    }
  };

  const getStatusIcon = (status: 'complete' | 'incomplete') => {
    if (status === 'complete') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-amber-500" />;
  };

  const getStatusBadge = (status: 'complete' | 'incomplete') => {
    if (status === 'complete') {
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
          Completo
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
        Incompleto
        </Badge>
    );
  };

  const handleSendToERP = async () => {
    if (stats.incomplete > 0) {
      toast.error(`Faltan ${stats.incomplete} PWNID por completar`);
      return;
    }

    const result = await onSendToERP();

    if (result.success && result.response) {
      toast.success('Datos enviados exitosamente al ERP');
      // Notificar al componente padre sobre la respuesta
      if (onERPResponseReceived) {
        onERPResponseReceived(result.response);
      }
    } else {
      toast.error(result.error || 'Error al enviar datos al ERP');
    }
  };

  return (
    <Card className="border-niawi-border bg-niawi-surface">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">Completar PWNID</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Ingrese el PWNID para cada Buyer PO antes de enviar al ERP
            </p>
          </div>
          <div className="flex items-center gap-4">
            {isAutoSaving && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 animate-pulse text-niawi-accent" />
                <span>Guardando...</span>
              </div>
            )}
            {!isAutoSaving && lastSaved && (
              <div className="text-sm text-muted-foreground">
                Guardado {lastSaved.toLocaleTimeString()}
              </div>
            )}
            <div className="text-right">
              <div className="text-2xl font-bold text-niawi-accent">
                {stats.complete} / {stats.total}
              </div>
              <div className="text-xs text-muted-foreground">Registros completos</div>
              <div className="text-xs font-medium text-green-500">
                {stats.percentage.toFixed(0)}%
              </div>
            </div>
            <Button
              onClick={handleSendToERP}
              disabled={stats.incomplete > 0 || isSendingToERP}
              className="bg-niawi-accent hover:bg-niawi-accent/90 disabled:opacity-50"
              size="lg"
            >
              {isSendingToERP ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Enviar al ERP
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {groups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay registros para mostrar
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {groups.map((group) => {
              const hasError = !!inputErrors[group.buyerPONumber];
              const inputValue = inputValues[group.buyerPONumber] || '';

              return (
                <div
                  key={group.buyerPONumber}
                  className="flex items-center gap-4 p-4 rounded-lg border border-niawi-border bg-niawi-bg hover:border-niawi-accent/50 transition-all"
                >
                  <div className="flex-shrink-0">
                    {getStatusIcon(group.status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">
                        Buyer PO: {group.buyerPONumber}
                      </span>
                      {getStatusBadge(group.status)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {group.recordCount} registro{group.recordCount !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="flex-shrink-0 w-48">
                    <div className="space-y-1">
                      <Input
                        ref={el => {
                          inputRefs.current[group.buyerPONumber] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        placeholder="Ej: 889"
                        value={inputValue}
                        onChange={(e) => handleInputChange(group.buyerPONumber, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(group.buyerPONumber, e)}
                        className={`
                          ${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                          ${group.status === 'complete' && !hasError ? 'border-green-500' : ''}
                        `}
                      />
                      {hasError && (
                        <p className="text-xs text-red-600">
                          {inputErrors[group.buyerPONumber]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {stats.incomplete > 0 && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">
                <strong className="text-amber-500">Atención:</strong> Faltan <span className="font-semibold text-amber-500">{stats.incomplete}</span> registro{stats.incomplete !== 1 ? 's' : ''} por completar.
                <div className="mt-1 text-muted-foreground">
                  Debe ingresar el PWNID para todos los Buyer PO antes de enviar al ERP.
                </div>
              </div>
            </div>
          </div>
        )}

        {stats.complete === stats.total && stats.total > 0 && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">
                <strong className="text-green-500">Listo para enviar:</strong> Todos los registros tienen PWNID completo.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
