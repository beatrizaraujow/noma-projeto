export class CreateRoutineDto {
  title: string;
  description?: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  allowedRoles?: string[];
  order?: number;
}
