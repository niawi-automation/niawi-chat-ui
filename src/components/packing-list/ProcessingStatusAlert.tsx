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

      {/* Alerta de Hojas No Procesadas (Prioridad 2) - PROMINENTE */}
      {hasUnprocessedSheets && (
        <Alert
          role="alert"
          className="border-2 border-amber-500 bg-amber-500/10 text-amber-900 dark:bg-amber-950 dark:text-amber-100"
        >
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-lg font-bold text-amber-700 dark:text-amber-400">
            ⚠️ Atención: Hojas No Procesadas
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2 p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-300 dark:border-amber-700">
              <p className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-1">
                {sheetsAnalysis.processedSheets} / {sheetsAnalysis.totalSheets} hojas procesadas
              </p>
              <div className="w-full h-3 bg-amber-200 dark:bg-amber-800 rounded-full mt-2 mb-3">
                <div
                  className="h-full bg-amber-600 dark:bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${sheetsAnalysis.processingRate}%` }}
                  aria-label={`${sheetsAnalysis.processingRate.toFixed(0)}% procesado`}
                />
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Tasa de procesamiento: <strong>{sheetsAnalysis.processingRate.toFixed(1)}%</strong>
              </p>
            </div>

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
