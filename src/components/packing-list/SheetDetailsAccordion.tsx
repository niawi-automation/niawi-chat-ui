import React, { useState, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Info, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { SheetsAnalysis, SheetDetail, PackingListStats } from '@/types/automations';

interface SheetDetailsAccordionProps {
  sheetsAnalysis: SheetsAnalysis;
  stats: PackingListStats;
}

const ITEMS_PER_PAGE = 20;

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

export const SheetDetailsAccordion: React.FC<SheetDetailsAccordionProps> = ({
  sheetsAnalysis,
  stats,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Extraer todas las tallas únicas y ordenarlas
  const uniqueSizes = useMemo(() => {
    const allSizes = new Set<string>();
    sheetsAnalysis.sheetDetails.forEach(sheet => {
      if (sheet.extractedData.sizeTotals) {
        Object.keys(sheet.extractedData.sizeTotals).forEach(size => allSizes.add(size));
      }
    });

    // Orden lógico de tallas
    const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '1X', '2X', '3X', '4X', '5X'];
    
    return Array.from(allSizes).sort((a, b) => {
      const indexA = sizeOrder.indexOf(a);
      const indexB = sizeOrder.indexOf(b);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      return a.localeCompare(b);
    });
  }, [sheetsAnalysis.sheetDetails]);

  // Paginación
  const totalPages = Math.ceil(sheetsAnalysis.sheetDetails.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentSheets = sheetsAnalysis.sheetDetails.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // Contar tallas totales (del global stats)
  const totalSizesCount = Object.keys(stats.sizeTotals).length;

  return (
    <Card>
      <CardContent className="p-0">
        <Accordion
          type="single"
          collapsible
          defaultValue="sheet-details"
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
              {/* Vista Desktop: Tabla Consolidada */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%] min-w-[250px]">Hoja</TableHead>
                      <TableHead className="w-[12%] min-w-[100px]">Estado</TableHead>
                      <TableHead className="w-[10%] min-w-[90px] text-right">Unidades</TableHead>
                      <TableHead className="w-[10%] min-w-[90px] text-right">Cartones</TableHead>
                      {uniqueSizes.map(size => (
                        <TableHead key={size} className="text-right min-w-[70px] font-bold">
                          {size}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Filas de hojas (paginadas) */}
                    {currentSheets.map((sheet, index) => {
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
                          {uniqueSizes.map(size => {
                            const qty = sheet.extractedData.sizeTotals?.[size];
                            return (
                              <TableCell key={size} className="text-right font-mono text-sm">
                                {qty !== undefined && qty > 0 ? qty.toLocaleString() : '—'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}

                    {/* Fila de TOTALES */}
                    <TableRow className="bg-muted/50 font-bold border-t-2 border-primary">
                      <TableCell className="text-base">TOTAL</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right text-base">
                        {stats.grandTotalUnits.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-base">
                        {stats.totalCartonsQty.toLocaleString()}
                      </TableCell>
                      {uniqueSizes.map(size => (
                        <TableCell key={size} className="text-right text-base">
                          {stats.sizeTotals[size]?.toLocaleString() || '—'}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Resumen de totales debajo de la tabla */}
                <div className="mt-4 pt-4 border-t text-center text-sm text-muted-foreground">
                  Total: {stats.grandTotalUnits.toLocaleString()} unidades en {totalSizesCount} talla{totalSizesCount !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Vista Mobile: Cards */}
              <div className="md:hidden space-y-3">
                {currentSheets.map((sheet, index) => {
                  const isProblematic =
                    sheet.status === 'error' ||
                    sheet.errors.length > 0 ||
                    sheet.warnings.length > 0;

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        isProblematic
                          ? 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-800'
                          : 'bg-card border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <p className="font-mono text-xs flex-1 mr-2" title={sheet.sheetName}>
                          {sheet.sheetName.length > 35
                            ? `${sheet.sheetName.substring(0, 35)}...`
                            : sheet.sheetName}
                        </p>
                        <StatusBadge status={sheet.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground text-xs">Unidades:</span>
                          <p className="font-semibold">
                            {sheet.extractedData.totalUnits > 0
                              ? sheet.extractedData.totalUnits.toLocaleString()
                              : '—'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Cartones:</span>
                          <p className="font-semibold">
                            {sheet.extractedData.cartonsCount > 0
                              ? sheet.extractedData.cartonsCount.toLocaleString()
                              : '—'}
                          </p>
                        </div>
                      </div>

                      {sheet.type === 'packing_data' && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="text-muted-foreground text-xs block mb-2">Tallas:</span>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            {uniqueSizes.map(size => {
                              const qty = sheet.extractedData.sizeTotals?.[size];
                              if (qty !== undefined && qty > 0) {
                                return (
                                  <div key={size} className="flex justify-between">
                                    <span className="font-medium">{size}:</span>
                                    <span className="font-mono">{qty}</span>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      )}

                      {sheet.type !== 'packing_data' && (
                        <div className="mt-2">
                          <span className="text-muted-foreground italic text-xs">[{sheet.type}]</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Totales en mobile */}
                <div className="p-4 rounded-lg border-2 border-primary bg-muted/50 font-semibold">
                  <p className="text-sm mb-3 text-center">TOTALES</p>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground text-xs">Unidades:</span>
                      <p className="font-bold text-base">{stats.grandTotalUnits.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Cartones:</span>
                      <p className="font-bold text-base">{stats.totalCartonsQty.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <span className="text-muted-foreground text-xs block mb-2">Por talla:</span>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      {uniqueSizes.map(size => {
                        const qty = stats.sizeTotals[size];
                        if (qty !== undefined && qty > 0) {
                          return (
                            <div key={size} className="flex justify-between">
                              <span className="font-bold">{size}:</span>
                              <span className="font-mono">{qty}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Controles de Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Mostrar errores/warnings si existen */}
              {sheetsAnalysis.sheetDetails.some(
                (s) => s.errors.length > 0 || s.warnings.length > 0
              ) && (
                <div className="mt-6 space-y-2">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
                    Alertas detectadas:
                  </p>
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
