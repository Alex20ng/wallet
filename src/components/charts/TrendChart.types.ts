export interface TrendDataPoint {
  label: string;
  income: number; // centimes
  expense: number; // centimes
  date: string;
}

export interface TrendChartProps {
  data: TrendDataPoint[];
  /** Hauteur totale du composant, étiquettes de l'axe X comprises */
  height?: number;
  showIncome?: boolean;
  showExpense?: boolean;
  showLegend?: boolean;
  animate?: boolean;
}
