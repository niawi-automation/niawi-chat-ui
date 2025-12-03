import { ProcessType, ProcessFileResponse, ProcessResults, AutomationProcess, WipWebhookResponse, PackingListRecord, FactoryType, WebhookExecution, ExecutionRecord, DashboardStats, ExecutionFilters } from '@/types/automations';

// Configuración de tipos de proceso
export const PROCESS_TYPES_CONFIG = {
  WIP: {
    id: 'WIP' as ProcessType,
    label: 'Work in Progress',
    description: 'Procesamiento de documentos de trabajo en progreso',
    webhookUrl: 'https://automation.wtsusa.us/webhook/WIPautomation',
    acceptedFileTypes: ['.xlsx', '.xls'],
    maxFileSize: 10 // MB
  },
  PO_BUYS: {
    id: 'PO_BUYS' as ProcessType,
    label: 'Purchase Orders',
    description: 'Procesamiento de órdenes de compra',
    webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_POBUYS || '',
    acceptedFileTypes: ['.xlsx', '.xls'],
    maxFileSize: 10 // MB
  },
  PACKING_LIST: {
    id: 'PACKING_LIST' as ProcessType,
    label: 'Packing List',
    description: 'Procesamiento de listas de empaque',
    webhookUrl: 'https://automation.wtsusa.us/webhook/automatizacionpackinglist',
    acceptedFileTypes: ['.xlsx', '.xls'],
    maxFileSize: 10 // MB
  }
};

// Función para validar archivo antes del envío
export const validateFile = (file: File, processType: ProcessType): { valid: boolean; error?: string } => {
  const config = PROCESS_TYPES_CONFIG[processType];
  
  // Verificar tipo de archivo
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!config.acceptedFileTypes.includes(fileExtension)) {
    return {
      valid: false,
      error: `Tipo de archivo no válido. Formatos aceptados: ${config.acceptedFileTypes.join(', ')}`
    };
  }
  
  // Verificar tamaño de archivo
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > config.maxFileSize) {
    return {
      valid: false,
      error: `El archivo es demasiado grande. Tamaño máximo: ${config.maxFileSize}MB`
    };
  }
  
  return { valid: true };
};

// Función para procesar archivo via webhook N8N
export const processFile = async (
  file: File, 
  processType: ProcessType,
  userId: string,
  userName: string,
  factoryType?: FactoryType
): Promise<ProcessFileResponse> => {
  try {
    const config = PROCESS_TYPES_CONFIG[processType];
    
    // Validar configuración del webhook
    if (!config.webhookUrl) {
      throw new Error(`URL del webhook para ${processType} no configurada`);
    }
    
    // Validar archivo
    const validation = validateFile(file, processType);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // Preparar FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('processType', processType);
    formData.append('userId', userId);
    formData.append('userName', userName);
    formData.append('timestamp', new Date().toISOString());
    
    // Agregar factory_type para WIP
    if (processType === 'WIP' && factoryType) {
      formData.append('factory_type', factoryType);
    }
    
    // Llamada al webhook N8N
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      body: formData,
      headers: {
        // No incluir Content-Type, el navegador lo establece automáticamente con boundary para FormData
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();

    // Caso especial para WIP: nuevos formato con records directamente
    if (processType === 'WIP' && Array.isArray(result)) {
      // Procesar el nuevo formato WIP: [{ records: [...] }]
      const wipData = result as WipWebhookResponse[];
      const allRecords: Array<Record<string, any>> = [];
      
      wipData.forEach((item) => {
        if (item.records && Array.isArray(item.records)) {
          allRecords.push(...item.records);
        }
      });

      if (allRecords.length > 0) {
        // Mapeo de campos del webhook (con espacios/mayúsculas) a formato interno (minúsculas con guiones bajos)
        const WIP_FIELD_MAPPING: Record<string, string> = {
          'BuyerName': 'buyer_name',
          'PWN No': 'pwn_no',
          'PONo': 'po_no',
          'ArticleCode': 'article_code',
          'ArticleDesc': 'article_desc',
          'BuyerStyleRef': 'buyer_style_ref',
          'Delivery Date': 'delivery_date',
          'ColorCode': 'color_code',
          'ColorName': 'color_name',
          'SizeCode': 'size_code',
          'POQty': 'po_qty',
          'ProcessName': 'process_name',
          'CurrentQty': 'current_qty',
          'BalanceQty': 'balance_qty',
          'StartProcess': 'start_process',
          'ActualStartDate': 'actual_start_date',
          'ReasonDesc': 'reason_desc',
          'EndProcess': 'end_process',
          'ActualEndDate': 'actual_end_date'
        };

        // Transformar cada registro del webhook al formato interno esperado
        const transformedRecords = allRecords.map((record) => {
          const transformed: Record<string, any> = {};
          
          // Mapear cada campo del webhook al formato interno
          for (const [webhookField, internalField] of Object.entries(WIP_FIELD_MAPPING)) {
            transformed[internalField] = record[webhookField] !== undefined ? record[webhookField] : null;
          }
          
          return transformed;
        });

        const wrapped: ProcessResults = {
          success: true,
          data: transformedRecords,
          processedAt: new Date().toISOString(),
          recordCount: transformedRecords.length
        };
        return {
          success: true,
          data: wrapped,
          processId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      }
    }

    // Caso especial para PACKING_LIST: formato con message.content y packs anidados
    if (processType === 'PACKING_LIST') {
      const flattenedRecords: PackingListRecord[] = [];

      // Manejar si es array o objeto único
      const dataArray = Array.isArray(result) ? result : [result];

      console.log('📦 Procesando datos de Packing List:', dataArray.length, 'elementos');

      dataArray.forEach((item: any, index: number) => {
        console.log(`📦 Procesando elemento ${index}:`, item);

        // Verificar si tiene la estructura nueva directa: { buyerPONumber, PWNID, packs }
        if (item.packs && Array.isArray(item.packs)) {
          const {
            buyerName,
            factoryName,
            userName,
            buyerERPCode,
            factoryERPCode,
            buyerPONumber,
            PONumberEDI,
            PWNID
          } = item;

          console.log('📦 Datos principales (formato directo):', { buyerName, factoryName, userName, buyerERPCode, factoryERPCode, buyerPONumber, PONumberEDI, PWNID });

          item.packs.forEach((pack: any, packIndex: number) => {
            console.log(`📦 Procesando pack ${packIndex}:`, pack);

            if (pack.sizeDetail && Array.isArray(pack.sizeDetail)) {
              pack.sizeDetail.forEach((sizeDetail: any, sizeIndex: number) => {
                console.log(`📦 Procesando sizeDetail ${sizeIndex}:`, sizeDetail);

                const flattenedRecord: PackingListRecord = {
                  BuyerName: buyerName || '',
                  FactoryName: factoryName || '',
                  UserName: userName || '',
                  BuyerERPCode: buyerERPCode || '',
                  FactoryERPCode: factoryERPCode || '',
                  BuyerPO: buyerPONumber || '',
                  PONumberEDI: PONumberEDI || '',
                  PWNID: PWNID ?? null,
                  DestinationCode: pack.AddressDestination || pack.destinationCode || '',
                  Style: pack.style || '',
                  DC: pack.DC || '',
                  Address: pack.Address || '',
                  City: pack.City || '',
                  State: pack.State || '',
                  PostalCode: pack.PostalCode || '',
                  Country: pack.Country || '',
                  CartonsQty: pack.CartonsQty || 0,
                  CartonLength: pack.CartonLength || 0,
                  CartonWidth: pack.CartonWidth || 0,
                  CartonHeight: pack.CartonHeight || 0,
                  CartonNetWg: pack.CartonNetWg || 0,
                  CartonGrossWg: pack.CartonGrossWg || 0,
                  NroPacking: pack.nroPacking || 0,
                  ColorName: sizeDetail.ColorName || '',
                  Size: sizeDetail.Size || '',
                  ShippedQty: sizeDetail.ShippedQty || 0
                };

                console.log('📦 Registro aplanado creado:', flattenedRecord);
                flattenedRecords.push(flattenedRecord);
              });
            }
          });
        }
        // Mantener compatibilidad con formato antiguo: { index, message: { role, content } }
        else if (item.message?.content?.packs && Array.isArray(item.message.content.packs)) {
          const {
            buyerName,
            factoryName,
            userName,
            buyerERPCode,
            factoryERPCode,
            buyerPONumber,
            PONumberEDI,
            PWNID
          } = item.message.content;
          
          console.log('📦 Datos principales (formato antiguo):', { buyerName, factoryName, userName, buyerERPCode, factoryERPCode, buyerPONumber, PONumberEDI, PWNID });

          item.message.content.packs.forEach((pack: any, packIndex: number) => {
            console.log(`📦 Procesando pack ${packIndex}:`, pack);

            if (pack.sizeDetail && Array.isArray(pack.sizeDetail)) {
              pack.sizeDetail.forEach((sizeDetail: any, sizeIndex: number) => {
                console.log(`📦 Procesando sizeDetail ${sizeIndex}:`, sizeDetail);

                const flattenedRecord: PackingListRecord = {
                  BuyerName: buyerName || '',
                  FactoryName: factoryName || '',
                  UserName: userName || '',
                  BuyerERPCode: buyerERPCode || '',
                  FactoryERPCode: factoryERPCode || '',
                  BuyerPO: buyerPONumber || '',
                  PONumberEDI: PONumberEDI || '',
                  PWNID: PWNID ?? null,
                  DestinationCode: pack.AddressDestination || pack.destinationCode || '',
                  Style: pack.style || '',
                  DC: pack.DC || '',
                  Address: pack.Address || '',
                  City: pack.City || '',
                  State: pack.State || '',
                  PostalCode: pack.PostalCode || '',
                  Country: pack.Country || '',
                  CartonsQty: pack.CartonsQty || 0,
                  CartonLength: pack.CartonLength || 0,
                  CartonWidth: pack.CartonWidth || 0,
                  CartonHeight: pack.CartonHeight || 0,
                  CartonNetWg: pack.CartonNetWg || 0,
                  CartonGrossWg: pack.CartonGrossWg || 0,
                  NroPacking: pack.nroPacking || 0,
                  ColorName: sizeDetail.ColorName || '',
                  Size: sizeDetail.Size || '',
                  ShippedQty: sizeDetail.ShippedQty || 0
                };

                console.log('📦 Registro aplanado creado:', flattenedRecord);
                flattenedRecords.push(flattenedRecord);
              });
            }
          });
        }
      });

      console.log('📦 Total de registros aplanados:', flattenedRecords.length);

      if (flattenedRecords.length > 0) {
        const wrapped: ProcessResults = {
          success: true,
          data: flattenedRecords,
          processedAt: new Date().toISOString(),
          recordCount: flattenedRecords.length
        };
        return {
          success: true,
          data: wrapped,
          processId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      }
    }

    // Caso 1: El webhook devuelve un array (formato genérico)
    if (Array.isArray(result)) {
      // 1a) Nuevo esquema: [{ data: [...] }]
      const first = result[0] as any;
      if (first && typeof first === 'object' && Array.isArray(first.data)) {
        const wrappedFromDataArray: ProcessResults = {
          success: true,
          data: first.data as Array<Record<string, any>>,
          processedAt: new Date().toISOString(),
          recordCount: (first.data as Array<unknown>).length
        };
        return {
          success: true,
          data: wrappedFromDataArray,
          processId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      }

      // 1b) Esquema previo: array directo de filas
      const wrapped: ProcessResults = {
        success: true,
        data: result as Array<Record<string, any>>,
        processedAt: new Date().toISOString(),
        recordCount: (result as Array<unknown>).length
      };
      return {
        success: true,
        data: wrapped,
        processId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    }

    // Caso 2: Objeto con campos esperados
    if (typeof result === 'object' && result !== null) {
      // Si ya trae success/data, lo respetamos
      if ('success' in result || 'data' in result) {
        const candidateData = (result as any).data;
        if (Array.isArray(candidateData)) {
          const wrappedFromObjectData: ProcessResults = {
            success: Boolean((result as any).success ?? true),
            data: candidateData as Array<Record<string, any>>,
            processedAt: new Date().toISOString(),
            recordCount: candidateData.length,
            fileUrl: (result as any).fileUrl,
            message: (result as any).message
          };
          return {
            success: true,
            data: wrappedFromObjectData,
            error: (result as any).error,
            processId: (result as any).processId || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };
        }
        // Si data no es array, se envuelve el objeto completo como fila única
        const wrappedSingle: ProcessResults = {
          success: Boolean((result as any).success ?? true),
          data: [(result as any)],
          processedAt: new Date().toISOString(),
          recordCount: 1,
          fileUrl: (result as any).fileUrl,
          message: (result as any).message
        };
        return {
          success: true,
          data: wrappedSingle,
          error: (result as any).error,
          processId: (result as any).processId || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      }

      // Si trae otros campos pero no success/data, lo envolvemos como data
      const wrapped: ProcessResults = {
        success: true,
        data: [result as Record<string, any>],
        processedAt: new Date().toISOString(),
        recordCount: 1
      };
      return {
        success: true,
        data: wrapped,
        processId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    }

    // Caso 3: Formato no reconocido
    throw new Error('Respuesta del servidor en formato inesperado');
    
  } catch (error) {
    console.error('Error procesando archivo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al procesar el archivo',
      processId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }
};

// Función para descargar archivo procesado
export const downloadProcessedFile = async (fileUrl: string, fileName: string): Promise<void> => {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Error al descargar el archivo');
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
  } catch (error) {
    console.error('Error descargando archivo:', error);
    throw new Error('No se pudo descargar el archivo procesado');
  }
};

// ========================================
// FUNCIONES PARA DASHBOARD DE EJECUCIONES EN TIEMPO REAL
// ========================================

const WEBHOOK_EXECUTIONS_URL = 'https://automation.wtsusa.us/webhook/reportewts';

/**
 * Obtener ejecuciones desde el webhook productivo de N8N
 */
export const fetchExecutions = async (): Promise<WebhookExecution[]> => {
  try {
    const response = await fetch(WEBHOOK_EXECUTIONS_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Validar que sea un array
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected array');
    }

    return data as WebhookExecution[];
  } catch (error) {
    console.error('Error fetching executions:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to fetch execution data'
    );
  }
};

/**
 * Transformar datos del webhook a formato UI-friendly
 */
export const transformExecutions = (
  executions: WebhookExecution[]
): ExecutionRecord[] => {
  return executions.map((exec) => {
    const startedAt = new Date(exec.startedAt);
    const stoppedAt = exec.stoppedAt ? new Date(exec.stoppedAt) : null;

    // Calcular duración en milliseconds
    const duration = stoppedAt
      ? stoppedAt.getTime() - startedAt.getTime()
      : null;

    return {
      id: exec.id,
      workflowName: exec.workflowName,
      status: exec.status,
      startedAt,
      stoppedAt,
      duration,
      mode: exec.mode,
      finished: exec.finished,
    };
  });
};

/**
 * Calcular estadísticas del dashboard desde los datos de ejecución
 */
export const calculateStats = (
  executions: ExecutionRecord[]
): DashboardStats => {
  const totalExecutions = executions.length;

  const successfulExecutions = executions.filter(
    (e) => e.status === 'success'
  ).length;

  const failedExecutions = executions.filter(
    (e) => e.status === 'error'
  ).length;

  const runningExecutions = executions.filter(
    (e) => !e.finished || e.status === 'running'
  ).length;

  const wipCount = executions.filter(
    (e) => e.workflowName === 'WIP'
  ).length;

  const packingListCount = executions.filter(
    (e) => e.workflowName === 'PackingList'
  ).length;

  // Calcular duración promedio (solo ejecuciones completadas)
  const completedWithDuration = executions.filter(
    (e) => e.duration !== null && e.finished
  );

  const averageDuration = completedWithDuration.length > 0
    ? completedWithDuration.reduce((sum, e) => sum + (e.duration || 0), 0) /
      completedWithDuration.length
    : 0;

  return {
    totalExecutions,
    successfulExecutions,
    failedExecutions,
    runningExecutions,
    averageDuration,
    wipCount,
    packingListCount,
  };
};

/**
 * Filtrar ejecuciones según criterios de filtrado
 */
export const filterExecutions = (
  executions: ExecutionRecord[],
  filters: ExecutionFilters
): ExecutionRecord[] => {
  return executions.filter((exec) => {
    // Filtro por workflow name
    if (filters.workflowName !== 'all' &&
        exec.workflowName !== filters.workflowName) {
      return false;
    }

    // Filtro por estado
    if (filters.status !== 'all' && exec.status !== filters.status) {
      return false;
    }

    // Filtro por fecha desde
    if (filters.dateFrom && exec.startedAt < filters.dateFrom) {
      return false;
    }

    // Filtro por fecha hasta (incluir todo el día)
    if (filters.dateTo) {
      const endOfDay = new Date(filters.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      if (exec.startedAt > endOfDay) {
        return false;
      }
    }

    // Filtro por término de búsqueda (buscar en ID)
    if (filters.searchTerm &&
        !exec.id.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });
};

/**
 * Formatear duración en formato legible
 */
export const formatDuration = (milliseconds: number | null): string => {
  if (milliseconds === null) return '-';

  const seconds = Math.floor(milliseconds / 1000);

  // Menos de 1 segundo
  if (seconds < 1) {
    return `${milliseconds}ms`;
  }

  // Menos de 1 minuto
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Menos de 1 hora
  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
};

// ========================================
// FUNCIONES MOCK (DEPRECADAS - MANTENER POR COMPATIBILIDAD)
// ========================================

// Función para obtener historial de procesos (mock por ahora)
export const getProcessHistory = async (): Promise<AutomationProcess[]> => {
  // TODO: Implementar llamada real a API cuando esté disponible
  // Por ahora retornamos datos mock
  return [
    {
      id: '1',
      type: 'WIP',
      fileName: 'wip_report_2024.xlsx',
      fileSize: 2048000,
      status: 'completed',
      uploadedAt: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
      processedAt: new Date(Date.now() - 86350000).toISOString(),
      userId: 'user1',
      userName: 'Usuario Demo',
      results: {
        success: true,
        data: [
          { id: 1, item: 'Producto A', status: 'En proceso', progress: '75%' },
          { id: 2, item: 'Producto B', status: 'Completado', progress: '100%' }
        ],
        fileUrl: 'https://example.com/processed/wip_report_2024_processed.xlsx',
        message: 'Procesamiento exitoso',
        processedAt: new Date(Date.now() - 86350000).toISOString(),
        recordCount: 2
      }
    },
    {
      id: '2',
      type: 'PO_BUYS',
      fileName: 'purchase_orders_q1.xlsx',
      fileSize: 1536000,
      status: 'completed',
      uploadedAt: new Date(Date.now() - 172800000).toISOString(), // 2 días atrás
      processedAt: new Date(Date.now() - 172700000).toISOString(),
      userId: 'user1',
      userName: 'Usuario Demo',
      results: {
        success: true,
        data: [
          { id: 1, supplier: 'Proveedor A', amount: '$15,000', status: 'Aprobado' },
          { id: 2, supplier: 'Proveedor B', amount: '$8,500', status: 'Pendiente' }
        ],
        fileUrl: 'https://example.com/processed/purchase_orders_q1_processed.xlsx',
        message: 'Procesamiento exitoso',
        processedAt: new Date(Date.now() - 172700000).toISOString(),
        recordCount: 2
      }
    },
    {
      id: '3',
      type: 'PACKING_LIST',
      fileName: 'packing_list_export.xlsx',
      fileSize: 1024000,
      status: 'failed',
      uploadedAt: new Date(Date.now() - 259200000).toISOString(), // 3 días atrás
      userId: 'user1',
      userName: 'Usuario Demo',
      error: 'Error en formato de archivo: columna requerida faltante'
    }
  ];
};

// Función para obtener estadísticas (mock por ahora)
export const getAutomationStats = async (): Promise<{ totalProcesses: number; successfulProcesses: number; failedProcesses: number; pendingProcesses: number }> => {
  const history = await getProcessHistory();

  return {
    totalProcesses: history.length,
    successfulProcesses: history.filter(p => p.status === 'completed').length,
    failedProcesses: history.filter(p => p.status === 'failed').length,
    pendingProcesses: history.filter(p => p.status === 'pending' || p.status === 'processing').length
  };
};

/**
 * Función para procesar re-upload de Excel con PWNID completado
 * Extrae los valores de PWNID del Excel y los retorna agrupados por BuyerPO
 */
export const parsePackingListExcelWithPWNID = async (
  file: File
): Promise<{ [buyerPONumber: string]: number | null }> => {
  try {
    // Validar que sea un archivo Excel
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!['.xlsx', '.xls'].includes(fileExtension)) {
      throw new Error('El archivo debe ser un Excel (.xlsx o .xls)');
    }

    // Importar la librería xlsx dinámicamente
    const XLSX = await import('xlsx');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('No se pudo leer el archivo'));
            return;
          }

          // Parsear el archivo Excel
          const workbook = XLSX.read(data, { type: 'binary' });

          // Obtener la primera hoja
          const sheetName = workbook.SheetNames[0];
          if (!sheetName) {
            reject(new Error('El archivo Excel está vacío'));
            return;
          }

          const worksheet = workbook.Sheets[sheetName];

          // Convertir a JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (!Array.isArray(jsonData) || jsonData.length === 0) {
            reject(new Error('El archivo Excel no contiene datos'));
            return;
          }

          // Extraer PWNID por BuyerPO
          const pwnidMap: { [buyerPONumber: string]: number | null } = {};

          jsonData.forEach((row: any) => {
            const buyerPO = row['BuyerPO'] || row['Buyer PO'];
            const pwnid = row['PWNID'];

            if (buyerPO && !pwnidMap[buyerPO]) {
              // Parsear PWNID
              if (pwnid === null || pwnid === undefined || pwnid === '') {
                pwnidMap[buyerPO] = null;
              } else {
                const parsed = Number(pwnid);
                if (!isNaN(parsed) && Number.isInteger(parsed) && parsed > 0) {
                  pwnidMap[buyerPO] = parsed;
                } else {
                  pwnidMap[buyerPO] = null;
                }
              }
            }
          });

          console.log('PWNID extraídos del Excel:', pwnidMap);
          resolve(pwnidMap);

        } catch (error) {
          reject(new Error(`Error al parsear el Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      reader.readAsBinaryString(file);
    });

  } catch (error) {
    console.error('Error procesando Excel con PWNID:', error);
    throw new Error(error instanceof Error ? error.message : 'Error al procesar el archivo Excel');
  }
};
