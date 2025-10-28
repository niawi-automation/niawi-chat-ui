import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Clock } from 'lucide-react';
import { AutomationProcessCard } from '@/components/AutomationProcessCard';
import WipResultsTable from '@/components/WipResultsTable';
import { ProcessResults } from '@/types/automations';
import { exportWipToXlsx } from '@/lib/exportExcel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Función para transformar datos del webhook a formato de tabla
const transformWipData = (rawData: Array<Record<string, any>>): Array<Record<string, any>> => {
  const transformedData: Array<Record<string, any>> = [];

  rawData.forEach((item) => {
    // Si el item tiene records directamente (nuevo formato)
    if (item && typeof item === 'object' && Array.isArray(item.records)) {
      item.records.forEach((record: Record<string, any>) => {
        transformedData.push(record);
      });
    } 
    // Si el item ya es un record individual (ya procesado)
    else if (item && typeof item === 'object' && (item.buyer_name !== undefined || item.article_code)) {
      transformedData.push(item);
    }
  });

  return transformedData;
};

const WipProcess: React.FC = () => {
  const [currentResults, setCurrentResults] = useState<ProcessResults | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleResultsUpdate = (results: ProcessResults) => {
    setCurrentResults(results);
    setIsWaiting(false);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Descarga automática del Excel cuando se reciben los datos
    if (results.data && results.data.length > 0) {
      setTimeout(() => {
        // Transformar los datos antes de exportar (igual que en WipResultsTable)
        const transformedData = transformWipData(results.data);
        console.log('📥 Datos transformados para exportación:', transformedData.length, 'registros');
        exportWipToXlsx(transformedData, 'WIP_procesado.xlsx');
        console.log('✅ Descarga automática de WIP iniciada');
      }, 500); // Pequeño delay para asegurar que la UI se actualice primero
    }
  };

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
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-niawi-accent/10 border border-niawi-accent/30 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4 text-niawi-accent" />
                <span className="text-sm">Tiempo total de procesamiento</span>
              </div>
              <span className="font-mono text-xl text-niawi-accent">
                {Math.floor(elapsedMs / 60000).toString().padStart(2, '0')}:
                {Math.floor((elapsedMs % 60000) / 1000).toString().padStart(2, '0')}
              </span>
            </div>
            <WipResultsTable
              data={currentResults.data}
              defaultPageSize={10}
              pageSizeOptions={[10, 25, 50]}
            />
            {currentResults.fileUrl && (
              <div className="flex items-center justify-center">
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = currentResults.fileUrl!;
                    link.download = 'WIP_procesado.xlsx';
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
      )}

      <Accordion type="single" collapsible defaultValue={currentResults ? undefined : 'upload'}>
        <AccordionItem value="upload" className="border border-niawi-border rounded-lg">
          <AccordionTrigger className="px-4 text-foreground">Cargar nuevo archivo</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <AutomationProcessCard
              processType="WIP"
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

export default WipProcess;


