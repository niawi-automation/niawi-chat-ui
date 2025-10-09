import * as XLSX from 'xlsx';

// Columnas fijas para WIP en el orden solicitado
export const WIP_COLUMNS: string[] = [
  'BuyerName',
  'PWN No',
  'PONo',
  'ArticleCode',
  'ArticleDesc',
  'BuyerStyleRef',
  'Delivery Date',
  'ColorCode',
  'ColorName',
  'SizeCode',
  'POQty',
  'ProcessName',
  'CurrentQty',
  'BalanceQty',
  'StartProcess',
  'ActualStartDate',
  'ReasonDesc',
  'EndProcess',
  'ActualEndDate',
  'Source File'
];

// Mapeo de campos del webhook a columnas de exportación
const WIP_FIELD_MAPPING: Record<string, string> = {
  'buyer_name': 'BuyerName',
  'pwn_no': 'PWN No',
  'po_no': 'PONo',
  'article_code': 'ArticleCode',
  'article_desc': 'ArticleDesc',
  'buyer_style_ref': 'BuyerStyleRef',
  'delivery_date': 'Delivery Date',
  'color_code': 'ColorCode',
  'color_name': 'ColorName',
  'size_code': 'SizeCode',
  'po_qty': 'POQty',
  'process_name': 'ProcessName',
  'current_qty': 'CurrentQty',
  'balance_qty': 'BalanceQty',
  'start_process': 'StartProcess',
  'actual_start_date': 'ActualStartDate',
  'reason_desc': 'ReasonDesc',
  'end_process': 'EndProcess',
  'actual_end_date': 'ActualEndDate',
  'source_file': 'Source File'
};

/**
 * Exporta a XLSX con columnas fijas para WIP.
 * Cualquier columna ausente en los datos se rellena con ''.
 */
export function exportWipToXlsx(rows: Array<Record<string, any>>, fileName = 'WIP_procesado.xlsx') {
  if (!Array.isArray(rows) || rows.length === 0) return;

  const normalized = rows.map((row) => {
    const output: Record<string, any> = {};
    
    // Mapear campos del webhook a columnas de exportación
    for (const [webhookField, exportColumn] of Object.entries(WIP_FIELD_MAPPING)) {
      output[exportColumn] = row[webhookField] ?? '';
    }
    
    // Asegurar que todas las columnas estén presentes
    for (const col of WIP_COLUMNS) {
      if (!(col in output)) {
        output[col] = '';
      }
    }
    
    return output;
  });

  const worksheet = XLSX.utils.json_to_sheet(normalized, { header: WIP_COLUMNS });

  // Ajuste simple de ancho de columnas basado en longitud de header
  const colWidths = WIP_COLUMNS.map((h) => ({ wch: Math.max(12, String(h).length + 2) }));
  (worksheet as any)['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'WIP');
  XLSX.writeFile(workbook, fileName);
}



