import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PackingListStats } from '@/types/automations';

interface SizeTotalsDisplayProps {
  stats: PackingListStats;
}

export const SizeTotalsDisplay: React.FC<SizeTotalsDisplayProps> = ({ stats }) => {
  const sizeTotals = stats.sizeTotals;
  const sizeEntries = Object.entries(sizeTotals);

  // Si no hay datos de tallas
  if (sizeEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Talla</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay datos de tallas disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  // Ordenar tallas de forma lógica (XS, S, M, L, XL, 1X, 2X, etc.)
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '1X', '2X', '3X', '4X', '5X'];

  const sortedSizes = sizeEntries.sort((a, b) => {
    const indexA = sizeOrder.indexOf(a[0]);
    const indexB = sizeOrder.indexOf(b[0]);

    // Si ambas están en el orden definido
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // Si solo una está en el orden definido
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // Si ninguna está en el orden, ordenar alfabéticamente
    return a[0].localeCompare(b[0]);
  });

  const maxQuantity = Math.max(...sizeEntries.map(([_, qty]) => qty));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución por Talla</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedSizes.map(([size, quantity]) => {
            const percentage = (quantity / stats.grandTotalUnits) * 100;
            const barPercentage = (quantity / maxQuantity) * 100;

            return (
              <div key={size} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium min-w-[3rem]">{size}</span>
                  <div className="flex-1 mx-4">
                    <Progress value={barPercentage} className="h-3" />
                  </div>
                  <span className="font-semibold min-w-[4rem] text-right">
                    {quantity.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground min-w-[3.5rem] text-right text-xs">
                    ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between font-medium">
            <span>Total:</span>
            <span>
              {stats.grandTotalUnits.toLocaleString()} unidades en{' '}
              {sizeEntries.length} talla{sizeEntries.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
