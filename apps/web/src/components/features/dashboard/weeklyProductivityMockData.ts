export interface WeeklyProductivityPoint {
  time: string;
  receita: number;
  pedidos: number;
}

export const weeklyProductivityMockData: WeeklyProductivityPoint[] = [
  { time: '04:00', receita: 0, pedidos: 0 },
  { time: '09:00', receita: 0, pedidos: 0 },
  { time: '14:00', receita: 0, pedidos: 0 },
  { time: '19:00', receita: 0, pedidos: 0 },
  { time: '00:00', receita: 0, pedidos: 0 },
];
