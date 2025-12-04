import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Info, AlertCircle } from 'lucide-react';
import { SheetsAnalysis, SheetDetail } from '@/types/automations';

interface SheetDetailsAccordionProps {
  sheetsAnalysis: SheetsAnalysis;
}

const StatusBadge: React.FC<{ status: SheetDetail['status'] }> = ({ status }) => {
  const configs = {
    processed: {
      icon: CheckCircle2,
      label: 'Procesada',
      variant: 'default' as const,
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    },
    skipped: {
      icon: Info,
      label: 'Omitida',
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    },
    error: {
      icon: XCircle,
      label: 'Error',
      variant: 'destructive' as const,
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    },
    empty: {
      icon: AlertCircle,
      label: 'Vacía',
      variant: 'outline' as const,
      className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
};

const formatSizeTotals = (sizeTotals: Record<string, number>): string => {
  if (Object.keys(sizeTotals).length === 0) {
    return '—';
  }

  return Object.entries(sizeTotals)
    .map(([size, qty]) => `${size}:${qty}`)
    .join(', ');
};

export const SheetDetailsAccordion: React.FC<SheetDetailsAccordionProps> = ({
  sheetsAnalysis,
}) => {
  // Determinar si debe auto-expandirse
  const shouldAutoExpand =
    sheetsAnalysis.hasProblematicSheets ||
    !sheetsAnalysis.allSheetsProcessed ||
    sheetsAnalysis.errorSheets > 0;

  return (
    <Card>
      <CardContent className="p-0">
        <Accordion
          type="single"
          collapsible
          defaultValue={shouldAutoExpand ? 'sheet-details' : undefined}
        >
          <AccordionItem value="sheet-details" className="border-0">
            <AccordionTrigger className="px-6 hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  Detalle por Hoja
                </span>
                <Badge variant="outline">
                  {sheetsAnalysis.sheetDetails.length} hojas
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Nombre de Hoja</TableHead>
                      <TableHead className="w-[15%]">Estado</TableHead>
                      <TableHead className="w-[10%] text-right">Unidades</TableHead>
                      <TableHead className="w-[10%] text-right">Cartones</TableHead>
                      <TableHead className="w-[25%]">Tallas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sheetsAnalysis.sheetDetails.map((sheet, index) => {
                      const isProblematic =
                        sheet.status === 'error' ||
                        sheet.errors.length > 0 ||
                        sheet.warnings.length > 0;

                      return (
                        <TableRow
                          key={index}
                          className={isProblematic ? 'bg-red-50 dark:bg-red-950' : ''}
                        >
                          <TableCell
                            className="max-w-[300px] truncate font-mono text-xs"
                            title={sheet.sheetName}
                          >
                            {sheet.sheetName}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={sheet.status} />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {sheet.extractedData.totalUnits > 0
                              ? sheet.extractedData.totalUnits.toLocaleString()
                              : '—'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {sheet.extractedData.cartonsCount > 0
                              ? sheet.extractedData.cartonsCount.toLocaleString()
                              : '—'}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {sheet.type === 'packing_data'
                              ? formatSizeTotals(sheet.extractedData.sizeTotals)
                              : <span className="text-muted-foreground italic">[{sheet.type}]</span>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mostrar errores/warnings si existen */}
              {sheetsAnalysis.sheetDetails.some(
                (s) => s.errors.length > 0 || s.warnings.length > 0
              ) && (
                <div className="mt-4 space-y-2">
                  {sheetsAnalysis.sheetDetails
                    .filter((s) => s.errors.length > 0 || s.warnings.length > 0)
                    .map((sheet, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800"
                      >
                        <p className="font-medium text-sm mb-1">
                          {sheet.sheetName}
                        </p>
                        {sheet.errors.length > 0 && (
                          <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
                            {sheet.errors.map((error, i) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        )}
                        {sheet.warnings.length > 0 && (
                          <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-300">
                            {sheet.warnings.map((warning, i) => (
                              <li key={i}>{warning}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
