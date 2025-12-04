import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { PackingListStats, SheetsAnalysis } from '@/types/automations';

interface ProcessingStatusAlertProps {
  stats: PackingListStats;
  sheetsAnalysis: SheetsAnalysis;
}

export const ProcessingStatusAlert: React.FC<ProcessingStatusAlertProps> = ({
  stats,
  sheetsAnalysis
}) => {
  const hasDiscrepancies = stats.hasDiscrepancies;
  const hasUnprocessedSheets = !sheetsAnalysis.allSheetsProcessed;

  // Si no hay problemas, no mostrar nada
  if (!hasDiscrepancies && !hasUnprocessedSheets) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Alerta de Discrepancias (Prioridad 1 - más crítico) */}
      {hasDiscrepancies && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Discrepancias Detectadas</AlertTitle>
          <AlertDescription>
            <strong>{stats.discrepanciesCount}</strong> discrepancia{stats.discrepanciesCount > 1 ? 's' : ''} detectada{stats.discrepanciesCount > 1 ? 's' : ''} entre
            los totales del "Summary By SKU" y la suma de cartones individuales.
            <br />
            <span className="text-sm mt-2 block">
              Confianza del procesamiento reducida en 15%. Se recomienda revisar la calidad de los datos del archivo Excel.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Alerta de Hojas No Procesadas (Prioridad 2) */}
      {hasUnprocessedSheets && (
        <Alert className="border-amber-500/30 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Hojas No Procesadas</AlertTitle>
          <AlertDescription>
            <p className="font-medium mb-2">
              {sheetsAnalysis.processedSheets} de {sheetsAnalysis.totalSheets} hojas fueron procesadas
              ({sheetsAnalysis.processingRate.toFixed(0)}%)
            </p>

            {sheetsAnalysis.summary.sheetsNotLoaded.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-1">Hojas no cargadas:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {sheetsAnalysis.summary.sheetsNotLoaded.map((sheetName, index) => {
                    // Buscar el tipo de hoja en sheetDetails
                    const sheetDetail = sheetsAnalysis.sheetDetails.find(
                      (s) => s.sheetName === sheetName
                    );
                    const sheetType = sheetDetail?.type || 'unknown';

                    return (
                      <li key={index}>
                        <span className="font-mono text-xs">{sheetName}</span>
                        {sheetType !== 'unknown' && (
                          <span className="ml-2 text-muted-foreground">
                            (tipo: {sheetType})
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {sheetsAnalysis.summary.sheetsWithWarnings.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-1">Hojas con advertencias:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {sheetsAnalysis.summary.sheetsWithWarnings.map((sheetName, index) => (
                    <li key={index}>
                      <span className="font-mono text-xs">{sheetName}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
