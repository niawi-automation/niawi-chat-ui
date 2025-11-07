import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Download, Clock, Upload, FileSpreadsheet } from 'lucide-react';
import { AutomationProcessCard } from '@/components/AutomationProcessCard';
import PackingListResultsTable from '@/components/PackingListResultsTable';
import { PackingListPWNIDPanel } from '@/components/PackingListPWNIDPanel';
import { ProcessResults, PackingListRecord } from '@/types/automations';
import { exportPackingListToXlsx } from '@/lib/exportExcel';
import { transformPackingListData } from '@/utils/packingListTransform';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { usePackingListPWNID } from '@/hooks/usePackingListPWNID';
import { updateMultiplePWNIDInRecords } from '@/utils/packingListGrouping';
import { parsePackingListExcelWithPWNID } from '@/services/automationService';
import { toast } from 'sonner';

const PackingListProcess: React.FC = () => {
  const [currentResults, setCurrentResults] = useState<ProcessResults | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [transformedData, setTransformedData] = useState<PackingListRecord[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hook para gestionar PWNID
  const {
    pwnidState,
    updatePWNID,
    getCompletionStats,
    getBuyerPOGroups,
    hasUnsavedChanges,
    lastSaved,
    sendToERP,
    isSendingToERP
  } = usePackingListPWNID({
    data: transformedData,
    sessionId
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleResultsUpdate = (results: ProcessResults) => {
    console.log('📦 Resultados recibidos en PackingListProcess:', results);
    setCurrentResults(results);
    setIsWaiting(false);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Generar ID de sesión único
    const newSessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);

    // Descarga automática del Excel cuando se reciben los datos
    if (results.data && results.data.length > 0) {
      console.log('📦 Iniciando descarga automática con', results.data.length, 'registros');

      // Los datos ya vienen transformados desde automationService.ts
      // Solo verificamos si necesitan transformación adicional
      const needsTransform = results.data.length > 0 && !('BuyerPO' in results.data[0]);

      const transformed = needsTransform
        ? transformPackingListData(results.data) as PackingListRecord[]
        : results.data as PackingListRecord[];

      console.log('📦 Datos para tabla:', transformed.length, 'registros', needsTransform ? '(transformados)' : '(directos)');

      // Guardar datos transformados en el estado
      setTransformedData(transformed);

      setTimeout(() => {
        try {
          exportPackingListToXlsx(transformed, 'PACKING_LIST_procesado.xlsx');
          console.log('📥 Descarga automática de Packing List iniciada exitosamente');
          toast.success('Excel descargado automáticamente');
        } catch (error) {
          console.error('❌ Error en descarga automática:', error);
          toast.error('Error al descargar Excel automáticamente');
        }
      }, 1500);
    } else {
      console.warn('⚠️ No hay datos para descarga automática');
    }
  };

  // Manejar re-upload de Excel con PWNID
  const handleExcelReupload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      toast.info('Procesando Excel...');
      const pwnidMap = await parsePackingListExcelWithPWNID(file);

      // Actualizar PWNID en el estado
      Object.entries(pwnidMap).forEach(([buyerPO, pwnid]) => {
        updatePWNID(buyerPO, pwnid);
      });

      // Actualizar datos transformados
      const updatedData = updateMultiplePWNIDInRecords(transformedData, pwnidMap);
      setTransformedData(updatedData);

      const updatedCount = Object.values(pwnidMap).filter(v => v !== null).length;
      toast.success(`Excel procesado: ${updatedCount} registros actualizados`);

      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error procesando Excel:', error);
      toast.error(error instanceof Error ? error.message : 'Error al procesar Excel');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Sincronizar cambios de PWNID con transformedData
  useEffect(() => {
    if (Object.keys(pwnidState).length > 0 && transformedData.length > 0) {
      const updatedData = updateMultiplePWNIDInRecords(transformedData, pwnidState);

      // Solo actualizar si realmente cambió algo
      const hasChanges = transformedData.some((record, index) => {
        return record.PWNID !== updatedData[index]?.PWNID;
      });

      if (hasChanges) {
        setTransformedData(updatedData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pwnidState]);

  return (
    <div className="space-y-6">
      {isWaiting && (
        <div className="sticky top-0 z-20">
          <div className="mb-4 rounded-lg bg-niawi-primary text-white px-4 py-3 shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Procesando archivo...</span>
              </div>
              <span className="font-mono text-2xl">
                {Math.floor(elapsedMs / 60000).toString().padStart(2, '0')}:
                {Math.floor((elapsedMs % 60000) / 1000).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      )}

      {currentResults && currentResults.data && currentResults.data.length > 0 && (
        <>
          {/* 1. Panel de PWNID - Primero */}
          <PackingListPWNIDPanel
            groups={getBuyerPOGroups()}
            stats={getCompletionStats()}
            onUpdatePWNID={updatePWNID}
            onSendToERP={sendToERP}
            isAutoSaving={hasUnsavedChanges}
            isSendingToERP={isSendingToERP}
            lastSaved={lastSaved}
          />

          {/* 2. Resultados - Segundo */}
          <Card className="bg-niawi-surface border-niawi-border">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-foreground">Resultados</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {currentResults.recordCount || currentResults.data.length} registros procesados
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-niawi-accent text-white">
                    <CheckCircle className="w-3 h-3 mr-1" /> Completado
                  </Badge>
                  <span className="font-mono text-lg text-niawi-accent">
                    {Math.floor(elapsedMs / 60000).toString().padStart(2, '0')}:
                    {Math.floor((elapsedMs % 60000) / 1000).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <PackingListResultsTable
                data={transformedData}
                defaultPageSize={10}
                pageSizeOptions={[10, 25, 50]}
              />
              {currentResults.fileUrl && (
                <div className="flex items-center justify-center">
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = currentResults.fileUrl!;
                      link.download = 'PACKING_LIST_procesado.xlsx';
                      link.click();
                    }}
                    className="bg-niawi-accent hover:bg-niawi-accent/90"
                  >
                    <Download className="w-4 h-4 mr-2" /> Descargar archivo procesado
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Sección de re-upload de Excel - Tercero */}
          <Card className="bg-niawi-surface border-niawi-border">
            <CardHeader>
              <CardTitle className="text-foreground text-base">¿Prefieres completar en Excel?</CardTitle>
              <CardDescription className="text-muted-foreground">
                Descarga el Excel, completa la columna PWNID y vuelve a cargarlo aquí
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Button
                  onClick={() => {
                    try {
                      exportPackingListToXlsx(transformedData, 'PACKING_LIST_con_PWNID.xlsx');
                      toast.success('Excel descargado correctamente');
                    } catch (error) {
                      toast.error('Error al descargar Excel');
                    }
                  }}
                  variant="outline"
                  className="border-niawi-border"
                >
                  <Download className="w-4 h-4 mr-2" /> 1. Descargar Excel
                </Button>

                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelReupload}
                    className="hidden"
                    id="excel-reupload"
                  />
                  <label htmlFor="excel-reupload">
                    <Button asChild variant="outline" className="border-niawi-border cursor-pointer">
                      <span>
                        <Upload className="w-4 h-4 mr-2" /> 2. Cargar Excel con PWNID
                      </span>
                    </Button>
                  </label>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Formato: .xlsx, .xls</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Accordion type="single" collapsible defaultValue={currentResults ? undefined : 'upload'}>
        <AccordionItem value="upload" className="border border-niawi-border rounded-lg">
          <AccordionTrigger className="px-4 text-foreground">Cargar nuevo archivo</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <AutomationProcessCard
              processType="PACKING_LIST"
              onResultsUpdate={handleResultsUpdate}
              onProcessingStart={() => {
                setIsWaiting(true);
                setElapsedMs(0);
                if (timerRef.current) window.clearInterval(timerRef.current);
                const id = window.setInterval(() => setElapsedMs((p) => p + 1000), 1000);
                timerRef.current = id as unknown as number;
              }}
              onProcessingError={() => {
                if (timerRef.current) {
                  window.clearInterval(timerRef.current);
                  timerRef.current = null;
                }
              }}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default PackingListProcess;


