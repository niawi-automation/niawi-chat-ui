// Tipos para el módulo de Automatizaciones

export type ProcessType = 'WIP' | 'PO_BUYS' | 'PACKING_LIST';

export type ProcessStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Tipos de fábrica para WIP
export type FactoryType = 
  | '4S'
  | 'ATLAS'
  | 'CATALOGO'
  | 'COTTON_CREATIONS'
  | 'DAMIR'
  | 'DISENO_ACMM'
  | 'FIL_EXPORT'
  | 'TAP'
  | 'TEXTIMAXX'
  | 'TRENTO'
  | 'VIRCATEX';

export interface AutomationProcess {
  id: string;
  type: ProcessType;
  fileName: string;
  fileSize: number;
  status: ProcessStatus;
  uploadedAt: string;
  processedAt?: string;
  userId: string;
  userName: string;
  results?: ProcessResults;
  error?: string;
}

export interface ProcessResults {
  success: boolean;
  data: Array<Record<string, any>>;
  fileUrl?: string;
  message?: string;
  processedAt: string;
  recordCount?: number;
  // NUEVOS CAMPOS para stats de Packing List
  stats?: PackingListStats;
  sheetsAnalysis?: SheetsAnalysis;
  _meta?: PackingDataMeta;
}

// Nuevo tipo para el formato WIP con records directamente
export interface WipWebhookResponse {
  records: Array<WipRecord>;
}

export interface WipRecord {
  buyer_name: string | null;
  pwn_no: number;
  po_no: string;
  article_code: string;
  article_desc: string | null;
  buyer_style_ref: string | null;
  delivery_date: string | null;
  color_code: string | null;
  color_name: string;
  size_code: string | null;
  po_qty: number;
  process_name: string;
  current_qty: number;
  balance_qty: number;
  start_process: string | null;
  actual_start_date: string | null;
  reason_desc: string;
  end_process: string | null;
  actual_end_date: string | null;
}

export interface ProcessTypeConfig {
  id: ProcessType;
  label: string;
  description: string;
  icon: string;
  webhookUrl: string;
  acceptedFileTypes: string[];
  maxFileSize: number; // en MB
}

export interface AutomationStats {
  totalProcesses: number;
  successfulProcesses: number;
  failedProcesses: number;
  pendingProcesses: number;
}

export interface ProcessHistoryFilters {
  type?: ProcessType;
  status?: ProcessStatus;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
}

// Respuesta de la API para procesamiento
export interface ProcessFileResponse {
  success: boolean;
  data?: ProcessResults;
  error?: string;
  processId: string;
}

// Tipos para Packing List
export interface PackingListWebhookResponse {
  index: number;
  message: {
    role: string;
    content: PackingListContent;
  };
}

export interface PackingListContent {
  buyerName: string | null;
  factoryName: string | null;
  userName: string | null;
  buyerERPCode: string | null;
  factoryERPCode: string | null;
  buyerPONumber: string;
  PONumberEDI: string | null;
  PWNID: number | null;
  packs: PackingListPack[];
}

export interface PackingListPack {
  destinationCode: string;
  style: string;
  DC: string;
  Address: string;
  City: string;
  PostalCode: string;
  State: string;
  Country: string;
  CartonsQty: number;
  CartonLength: number;
  CartonWidth: number;
  CartonHeight: number;
  CartonNetWg: number;
  CartonGrossWg: number;
  nroPacking: number;
  sizeDetail: PackingListSizeDetail[];
}

export interface PackingListSizeDetail {
  ColorName: string;
  Size: string;
  ShippedQty: number;
}

// Registro aplanado para tabla/Excel
export interface PackingListRecord {
  BuyerName: string | null;
  FactoryName: string | null;
  UserName: string | null;
  BuyerERPCode: string | null;
  FactoryERPCode: string | null;
  BuyerPO: string;
  PONumberEDI: string | null;
  PWNID: number | null;
  DestinationCode: string;
  Style: string;
  DC: string;
  Address: string;
  City: string;
  State: string;
  PostalCode: string;
  Country: string;
  CartonsQty: number;
  CartonLength: number;
  CartonWidth: number;
  CartonHeight: number;
  CartonNetWg: number;
  CartonGrossWg: number;
  NroPacking: number;
  ColorName: string;
  Size: string;
  ShippedQty: number;
}

// Estado local del componente
export interface AutomationState {
  selectedFile: File | null;
  selectedProcessType: ProcessType | null;
  isProcessing: boolean;
  currentResults: ProcessResults | null;
  error: string | null;
  factoryType?: FactoryType | null;
}

// Tipos para gestión de PWNID
export type PWNIDStatus = 'complete' | 'incomplete';

export interface BuyerPOGroup {
  buyerPONumber: string;
  PWNID: number | null;
  status: PWNIDStatus;
  recordCount: number;
}

export interface PWNIDEditState {
  [buyerPONumber: string]: number | null;
}

export interface PWNIDCompletionStats {
  total: number;
  complete: number;
  incomplete: number;
  percentage: number;
}

// Tipos para respuesta del ERP
export interface ERPResponse {
  packingListId?: string;
  packingListNumber?: string;
  buyerPO?: string;
  warnings?: string[];
}

export interface SendToERPResult {
  success: boolean;
  error?: string;
  response?: ERPResponse;
}

// ==========================================
// NUEVOS TIPOS PARA STATS DE PACKING LIST
// ==========================================

/**
 * Respuesta completa del webhook (siempre array con 1 elemento)
 */
export interface PackingDataResponse {
  packingData: PackingListContent; // Estructura original para Excel
  stats: PackingListStats;
  _meta: PackingDataMeta;
}

/**
 * Estadísticas globales del documento procesado
 */
export interface PackingListStats {
  // Conteos generales
  orderTotalsCount: number;
  shippingCartonsCount: number;

  // Información del PO
  buyerPONumber: string;
  globalStyle: string;
  globalDC: string;

  // Totales de unidades
  sizeTotals: Record<string, number>; // { "1X": 17, "2X": 15, ... }
  grandTotalUnits: number;
  totalCartonsQty: number;

  // Valores únicos
  uniqueDCs: string[];
  uniqueStyles: string[];
  uniqueColors: string[];

  // Flags de calidad de datos
  hasSummaryBySKU: boolean;
  hasCartonData: boolean;
  hasDiscrepancies: boolean;
  discrepanciesCount: number;

  // Análisis de hojas
  sheetsAnalysis: SheetsAnalysis;
}

/**
 * Análisis del procesamiento de hojas
 */
export interface SheetsAnalysis {
  // Contadores
  totalSheets: number;
  processedSheets: number;
  skippedSheets: number;
  errorSheets: number;

  // Indicadores
  allSheetsProcessed: boolean;
  processingRate: number; // 0-100

  // Clasificación por tipo
  sheetsByType: {
    packing_data: number;
    address_book: number;
    metadata_only: number;
    empty: number;
    unknown: number;
  };

  // Problemas
  hasProblematicSheets: boolean;
  problematicSheets: string[];

  // Resumen
  summary: {
    message: string;
    sheetsNotLoaded: string[];
    sheetsWithWarnings: string[];
  };

  // Detalles por hoja
  sheetDetails: SheetDetail[];
}

/**
 * Detalle individual de cada hoja procesada
 */
export interface SheetDetail {
  sheetName: string;
  status: 'processed' | 'skipped' | 'error' | 'empty';
  type: 'packing_data' | 'address_book' | 'metadata_only' | 'empty' | 'unknown';

  hasCartonData: boolean;
  hasSummaryData: boolean;

  extractedData: {
    style: string | null;
    DC: string | null;
    totalUnits: number;
    cartonsCount: number;
    sizeTotals: Record<string, number>;
  };

  warnings: string[];
  errors: string[];
}

/**
 * Metadata del procesamiento
 */
export interface PackingDataMeta {
  processedAt: string; // ISO timestamp
  packsCount: number;
  hasStats: boolean;
}

// Tipos para dashboard de ejecuciones en tiempo real

// Respuesta del webhook de N8N
export interface WebhookExecution {
  id: string;
  finished: boolean;
  mode: string;
  retryOf: string | null;
  retrySuccessId: string | null;
  status: 'success' | 'error' | 'running';
  startedAt: string;
  stoppedAt: string | null;
  workflowId: string;
  waitTill: string | null;
  workflowName: 'WIP' | 'PackingList';
}

// Registro transformado para la UI
export interface ExecutionRecord {
  id: string;
  workflowName: 'WIP' | 'PackingList';
  status: 'success' | 'error' | 'running';
  startedAt: Date;
  stoppedAt: Date | null;
  duration: number | null; // milliseconds
  mode: string;
  finished: boolean;
}

// Estadísticas del dashboard
export interface DashboardStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  runningExecutions: number;
  averageDuration: number; // milliseconds
  wipCount: number;
  packingListCount: number;
}

// Estado de filtros para la tabla de ejecuciones
export interface ExecutionFilters {
  workflowName: 'WIP' | 'PackingList' | 'all';
  status: 'success' | 'error' | 'running' | 'all';
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  searchTerm: string;
}

