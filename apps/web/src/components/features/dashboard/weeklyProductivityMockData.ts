export interface WeeklyProductivityPoint {
  time: string;
  receita: number;
  pedidos: number;
}

export const weeklyProductivityMockData: WeeklyProductivityPoint[] = [
  { time: '04:00', receita: 32, pedidos: 21 },
  { time: '09:00', receita: 58, pedidos: 46 },
  { time: '14:00', receita: 74, pedidos: 62 },
  { time: '19:00', receita: 67, pedidos: 54 },
  { time: '00:00', receita: 43, pedidos: 31 },
];
