import { useState, useEffect, useCallback } from 'react';
import type {
  PWNIDEditState,
  PWNIDCompletionStats,
  BuyerPOGroup,
  PackingListRecord,
  SendToERPResult
} from '@/types/automations';

const STORAGE_KEY_PREFIX = 'packing_list_pwnid_state_';

interface UsePackingListPWNIDProps {
  data: PackingListRecord[];
  sessionId?: string;
}

interface UsePackingListPWNIDReturn {
  pwnidState: PWNIDEditState;
  updatePWNID: (buyerPONumber: string, pwnid: number | null) => void;
  getPWNIDStatus: (buyerPONumber: string) => 'complete' | 'incomplete';
  getCompletionStats: () => PWNIDCompletionStats;
  getBuyerPOGroups: () => BuyerPOGroup[];
  clearAllPWNID: () => void;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  sendToERP: () => Promise<SendToERPResult>;
  isSendingToERP: boolean;
}

export function usePackingListPWNID({
  data,
  sessionId
}: UsePackingListPWNIDProps): UsePackingListPWNIDReturn {
  const [pwnidState, setPwnidState] = useState<PWNIDEditState>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSendingToERP, setIsSendingToERP] = useState(false);

  const storageKey = sessionId
    ? `${STORAGE_KEY_PREFIX}${sessionId}`
    : `${STORAGE_KEY_PREFIX}current`;

  // Inicializar estado desde data o LocalStorage
  useEffect(() => {
    if (data.length === 0) return;

    // Intentar recuperar de LocalStorage primero
    const savedState = localStorage.getItem(storageKey);

    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setPwnidState(parsed.pwnidState || {});
        setLastSaved(parsed.lastSaved ? new Date(parsed.lastSaved) : null);
        console.log('Recuperado estado de PWNID desde LocalStorage');
      } catch (error) {
        console.error('Error al recuperar estado de LocalStorage:', error);
        initializeFromData();
      }
    } else {
      initializeFromData();
    }

    function initializeFromData() {
      // Inicializar desde los datos recibidos
      const initialState: PWNIDEditState = {};
      const uniqueBuyerPOs = new Set<string>();

      data.forEach(record => {
        if (!uniqueBuyerPOs.has(record.BuyerPO)) {
          uniqueBuyerPOs.add(record.BuyerPO);
          initialState[record.BuyerPO] = record.PWNID;
        }
      });

      setPwnidState(initialState);
    }
  }, [data, storageKey]);

  // Auto-save a LocalStorage cada 2 segundos cuando hay cambios
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timeoutId = setTimeout(() => {
      try {
        const dataToSave = {
          pwnidState,
          lastSaved: new Date().toISOString(),
          sessionId
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        console.log('Estado de PWNID guardado automáticamente');
      } catch (error) {
        console.error('Error al guardar en LocalStorage:', error);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [pwnidState, hasUnsavedChanges, storageKey, sessionId]);

  // Actualizar PWNID para un BuyerPO específico
  const updatePWNID = useCallback((buyerPONumber: string, pwnid: number | null) => {
    setPwnidState(prev => ({
      ...prev,
      [buyerPONumber]: pwnid
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Obtener estado de un BuyerPO específico
  const getPWNIDStatus = useCallback((buyerPONumber: string): 'complete' | 'incomplete' => {
    const pwnid = pwnidState[buyerPONumber];
    return pwnid && pwnid > 0 ? 'complete' : 'incomplete';
  }, [pwnidState]);

  // Obtener estadísticas de completado
  const getCompletionStats = useCallback((): PWNIDCompletionStats => {
    const buyerPOs = Object.keys(pwnidState);
    const total = buyerPOs.length;
    const complete = buyerPOs.filter(po => {
      const pwnid = pwnidState[po];
      return pwnid && pwnid > 0;
    }).length;
    const incomplete = total - complete;
    const percentage = total > 0 ? (complete / total) * 100 : 0;

    return { total, complete, incomplete, percentage };
  }, [pwnidState]);

  // Obtener grupos de BuyerPO con su información
  const getBuyerPOGroups = useCallback((): BuyerPOGroup[] => {
    const groups: BuyerPOGroup[] = [];
    const buyerPOCounts: { [key: string]: number } = {};

    // Contar registros por BuyerPO
    data.forEach(record => {
      buyerPOCounts[record.BuyerPO] = (buyerPOCounts[record.BuyerPO] || 0) + 1;
    });

    // Crear grupos
    Object.keys(pwnidState).forEach(buyerPONumber => {
      const pwnid = pwnidState[buyerPONumber];
      const status = pwnid && pwnid > 0 ? 'complete' : 'incomplete';

      groups.push({
        buyerPONumber,
        PWNID: pwnid,
        status,
        recordCount: buyerPOCounts[buyerPONumber] || 0
      });
    });

    // Ordenar: incompletos primero, luego por BuyerPO
    return groups.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'incomplete' ? -1 : 1;
      }
      return a.buyerPONumber.localeCompare(b.buyerPONumber);
    });
  }, [pwnidState, data]);

  // Limpiar todos los PWNID
  const clearAllPWNID = useCallback(() => {
    const clearedState: PWNIDEditState = {};
    Object.keys(pwnidState).forEach(key => {
      clearedState[key] = null;
    });
    setPwnidState(clearedState);
    setHasUnsavedChanges(true);
  }, [pwnidState]);

  // Enviar datos al ERP
  const sendToERP = useCallback(async (): Promise<SendToERPResult> => {
    try {
      setIsSendingToERP(true);

      // Verificar que todos los PWNID estén completos
      const stats = getCompletionStats();
      if (stats.incomplete > 0) {
        setIsSendingToERP(false);
        return {
          success: false,
          error: `Faltan ${stats.incomplete} PWNID por completar`
        };
      }

      // Reconstruir la estructura original del webhook con PWNID actualizado
      // Agrupar registros por BuyerPO para reconstruir el formato original
      const buyerPOGroups = new Map<string, PackingListRecord[]>();

      data.forEach(record => {
        const buyerPO = record.BuyerPO;
        if (!buyerPOGroups.has(buyerPO)) {
          buyerPOGroups.set(buyerPO, []);
        }
        // Actualizar PWNID del registro con el valor del estado
        const updatedRecord = {
          ...record,
          PWNID: pwnidState[buyerPO] ?? record.PWNID
        };
        buyerPOGroups.get(buyerPO)!.push(updatedRecord);
      });

      // Construir el payload con la estructura del webhook original
      const payload: any[] = [];

      buyerPOGroups.forEach((records, buyerPO) => {
        const firstRecord = records[0];

        // Agrupar por pack (por destinationCode + style)
        const packGroups = new Map<string, PackingListRecord[]>();

        records.forEach(record => {
          const packKey = `${record.DestinationCode}_${record.Style}_${record.NroPacking}`;
          if (!packGroups.has(packKey)) {
            packGroups.set(packKey, []);
          }
          packGroups.get(packKey)!.push(record);
        });

        // Construir packs
        const packs: any[] = [];
        packGroups.forEach((packRecords) => {
          const packRecord = packRecords[0];

          packs.push({
            AddressDestination: packRecord.DestinationCode,
            destinationCode: packRecord.DestinationCode,
            style: packRecord.Style,
            DC: packRecord.DC,
            Address: packRecord.Address,
            City: packRecord.City,
            PostalCode: packRecord.PostalCode,
            State: packRecord.State,
            Country: packRecord.Country,
            CartonsQty: packRecord.CartonsQty,
            CartonLength: packRecord.CartonLength,
            CartonWidth: packRecord.CartonWidth,
            CartonHeight: packRecord.CartonHeight,
            CartonNetWg: packRecord.CartonNetWg,
            CartonGrossWg: packRecord.CartonGrossWg,
            nroPacking: packRecord.NroPacking,
            sizeDetail: packRecords.map(r => ({
              ColorName: r.ColorName,
              Size: r.Size,
              ShippedQty: r.ShippedQty
            }))
          });
        });

        payload.push({
          buyerName: firstRecord.BuyerName,
          factoryName: firstRecord.FactoryName,
          userName: firstRecord.UserName,
          buyerERPCode: firstRecord.BuyerERPCode,
          factoryERPCode: firstRecord.FactoryERPCode,
          buyerPONumber: firstRecord.BuyerPO,
          PONumberEDI: firstRecord.PONumberEDI,
          PWNID: pwnidState[buyerPO], // PWNID completado por el usuario
          packs
        });
      });

      console.log('📤 Enviando datos al ERP:', payload);

      // Enviar al webhook del ERP
      const response = await fetch('https://automation.wtsusa.us/webhook/PackingListenvioalERP', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Respuesta del ERP:', result);

      setIsSendingToERP(false);
      return {
        success: true,
        response: result
      };

    } catch (error) {
      console.error('❌ Error enviando al ERP:', error);
      setIsSendingToERP(false);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al enviar al ERP'
      };
    }
  }, [data, pwnidState, getCompletionStats]);

  return {
    pwnidState,
    updatePWNID,
    getPWNIDStatus,
    getCompletionStats,
    getBuyerPOGroups,
    clearAllPWNID,
    hasUnsavedChanges,
    lastSaved,
    sendToERP,
    isSendingToERP
  };
}
