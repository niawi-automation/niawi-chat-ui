import type { PackingListRecord, BuyerPOGroup, PWNIDCompletionStats } from '@/types/automations';

/**
 * Agrupa registros de Packing List por BuyerPONumber
 * Extrae información única de cada grupo
 */
export function groupByBuyerPO(records: PackingListRecord[]): BuyerPOGroup[] {
  const groupMap = new Map<string, BuyerPOGroup>();

  records.forEach(record => {
    const { BuyerPO, PWNID } = record;

    if (!groupMap.has(BuyerPO)) {
      // Crear nuevo grupo
      const status = PWNID && PWNID > 0 ? 'complete' : 'incomplete';
      groupMap.set(BuyerPO, {
        buyerPONumber: BuyerPO,
        PWNID: PWNID,
        status,
        recordCount: 1
      });
    } else {
      // Incrementar contador de registros
      const group = groupMap.get(BuyerPO)!;
      group.recordCount++;
    }
  });

  // Convertir Map a Array y ordenar: incompletos primero, luego alfabéticamente
  return Array.from(groupMap.values()).sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'incomplete' ? -1 : 1;
    }
    return a.buyerPONumber.localeCompare(b.buyerPONumber);
  });
}

/**
 * Calcula estadísticas de completado de PWNID
 */
export function getRecordsStats(groups: BuyerPOGroup[]): PWNIDCompletionStats {
  const total = groups.length;
  const complete = groups.filter(g => g.status === 'complete').length;
  const incomplete = total - complete;
  const percentage = total > 0 ? (complete / total) * 100 : 0;

  return {
    total,
    complete,
    incomplete,
    percentage
  };
}

/**
 * Valida si un valor de PWNID es válido
 */
export function isValidPWNID(value: any): boolean {
  if (value === null || value === undefined || value === '') {
    return false;
  }

  const num = Number(value);

  // Debe ser un número entero positivo
  return !isNaN(num) && Number.isInteger(num) && num > 0;
}

/**
 * Parsea un valor de input a número o null
 */
export function parsePWNIDInput(value: string): number | null {
  if (!value || value.trim() === '') {
    return null;
  }

  const trimmed = value.trim();
  const num = Number(trimmed);

  if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
    return null;
  }

  return num;
}

/**
 * Actualiza PWNID en todos los registros de un BuyerPO específico
 */
export function updatePWNIDInRecords(
  records: PackingListRecord[],
  buyerPONumber: string,
  newPWNID: number | null
): PackingListRecord[] {
  return records.map(record => {
    if (record.BuyerPO === buyerPONumber) {
      return {
        ...record,
        PWNID: newPWNID
      };
    }
    return record;
  });
}

/**
 * Actualiza múltiples PWNID en los registros
 */
export function updateMultiplePWNIDInRecords(
  records: PackingListRecord[],
  pwnidMap: { [buyerPONumber: string]: number | null }
): PackingListRecord[] {
  return records.map(record => ({
    ...record,
    PWNID: pwnidMap[record.BuyerPO] ?? record.PWNID
  }));
}
