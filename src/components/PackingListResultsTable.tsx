import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { exportPackingListToXlsx } from '@/lib/exportExcel';

interface PackingListResultsTableProps {
  data: Array<Record<string, any>>;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  onExport?: () => void;
}

// Columnas específicas para Packing List en el orden correcto
const PACKING_LIST_TABLE_COLUMNS = [
  'BuyerPO',
  'PONumberEDI',
  'DC',
  'City',
  'State',
  'PostalCode',
  'Country',
  'Style',
  'ColorName',
  'Size',
  'ShippedQty',
  'CartonsQty',
  'CartonLength',
  'CartonWidth',
  'CartonHeight',
  'CartonNetWg',
  'CartonGrossWg'
];

// Mapeo de campos a nombres de columnas más legibles
const PACKING_LIST_COLUMN_NAMES: Record<string, string> = {
  'BuyerPO': 'Buyer PO',
  'PONumberEDI': 'PO Number EDI',
  'DC': 'DC',
  'City': 'City',
  'State': 'State',
  'PostalCode': 'Postal Code',
  'Country': 'Country',
  'Style': 'Style',
  'ColorName': 'Color Name',
  'Size': 'Size',
  'ShippedQty': 'Shipped Qty',
  'CartonsQty': 'Cartons Qty',
  'CartonLength': 'Carton Length',
  'CartonWidth': 'Carton Width',
  'CartonHeight': 'Carton Height',
  'CartonNetWg': 'Carton Net Wg',
  'CartonGrossWg': 'Carton Gross Wg'
};

// Función para transformar datos del webhook a formato de tabla
const transformPackingListData = (rawData: Array<Record<string, any>>): Array<Record<string, any>> => {
  // Los datos ya vienen aplanados del servicio, solo necesitamos verificar que estén en el formato correcto
  return rawData.filter(item => 
    item && 
    typeof item === 'object' && 
    (item.BuyerPO !== undefined || item.Style !== undefined)
  );
};

export const PackingListResultsTable: React.FC<PackingListResultsTableProps> = ({
  data,
  defaultPageSize = 10,
  pageSizeOptions = [10, 25, 50],
  onExport,
}) => {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);

  // Transformar los datos
  const transformedData = React.useMemo(() => transformPackingListData(data), [data]);

  const total = transformedData.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const paginated = React.useMemo(() => transformedData.slice(start, end), [transformedData, start, end]);

  React.useEffect(() => {
    // Ajustar página si el tamaño cambia o el total disminuye
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (!transformedData || transformedData.length === 0) {
    return (
      <div className="border border-niawi-border rounded-lg p-6 text-center text-muted-foreground">
        Sin datos para mostrar
      </div>
    );
  }

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      // Usar los datos transformados que ya están siendo mostrados en la tabla
      exportPackingListToXlsx(transformedData, 'PACKING_LIST_procesado.xlsx');
    }
  };

  return (
    <div className="space-y-4">
      <div className="border border-niawi-border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-niawi-bg/50">
              {PACKING_LIST_TABLE_COLUMNS.map((column) => (
                <TableHead key={column} className="text-foreground whitespace-nowrap">
                  {PACKING_LIST_COLUMN_NAMES[column] || column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((row, idx) => (
              <TableRow key={idx} className="hover:bg-niawi-bg/30">
                {PACKING_LIST_TABLE_COLUMNS.map((column, ci) => (
                  <TableCell key={ci} className="text-foreground whitespace-nowrap">
                    {row[column] == null ? '' : String(row[column])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {start + 1}-{end} de {total}
        </div>

        <div className="flex items-center gap-3">
          <select
            className="bg-transparent border border-niawi-border rounded-md px-2 py-1 text-sm text-foreground"
            value={pageSize}
            onChange={(e) => {
              const size = Number(e.target.value);
              setPageSize(size);
              setPage(1);
            }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-niawi-surface text-foreground">
                {opt} / página
              </option>
            ))}
          </select>

          <div className="inline-flex items-center gap-1">
            <Button variant="outline" size="sm" className="border-niawi-border" onClick={() => setPage(1)} disabled={page === 1}>
              «
            </Button>
            <Button variant="outline" size="sm" className="border-niawi-border" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              ‹
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {page} / {totalPages}
            </span>
            <Button variant="outline" size="sm" className="border-niawi-border" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              ›
            </Button>
            <Button variant="outline" size="sm" className="border-niawi-border" onClick={() => setPage(totalPages)} disabled={page === totalPages}>
              »
            </Button>
          </div>

          <Button onClick={handleExport} size="sm" className="bg-niawi-accent hover:bg-niawi-accent/90">
            Exportar a Excel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PackingListResultsTable;
