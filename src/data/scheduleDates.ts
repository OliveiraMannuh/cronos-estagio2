export interface ScheduleDate {
  date: string; // DD/MM
  day: string;
}

// Datas letivas do cronograma (19/08 a 13/11), excluindo os dias sem aula.
// Mantido em sincronia manualmente com as datas de WEEKS_INTERPRETACAO/WEEKS_REDACAO em ClassSchedule.tsx.
export const SCHEDULE_DATES: ScheduleDate[] = [
  { date: '19/08', day: 'Quarta' },
  { date: '21/08', day: 'Sexta' },
  { date: '25/08', day: 'Terça' },
  { date: '26/08', day: 'Quarta' },
  { date: '28/08', day: 'Sexta' },
  { date: '01/09', day: 'Terça' },
  { date: '02/09', day: 'Quarta' },
  { date: '04/09', day: 'Sexta' },
  { date: '08/09', day: 'Terça' },
  { date: '09/09', day: 'Quarta' },
  { date: '11/09', day: 'Sexta' },
  { date: '15/09', day: 'Terça' },
  { date: '16/09', day: 'Quarta' },
  { date: '18/09', day: 'Sexta' },
  { date: '22/09', day: 'Terça' },
  { date: '23/09', day: 'Quarta' },
  { date: '25/09', day: 'Sexta' },
  { date: '29/09', day: 'Terça' },
  { date: '30/09', day: 'Quarta' },
  { date: '02/10', day: 'Sexta' },
  { date: '06/10', day: 'Terça' },
  { date: '07/10', day: 'Quarta' },
  { date: '09/10', day: 'Sexta' },
  { date: '13/10', day: 'Terça' },
  { date: '14/10', day: 'Quarta' },
  { date: '20/10', day: 'Terça' },
  { date: '21/10', day: 'Quarta' },
  { date: '23/10', day: 'Sexta' },
  { date: '27/10', day: 'Terça' },
  { date: '30/10', day: 'Sexta' },
  { date: '03/11', day: 'Terça' },
  { date: '04/11', day: 'Quarta' },
  { date: '06/11', day: 'Sexta' },
  { date: '10/11', day: 'Terça' },
  { date: '11/11', day: 'Quarta' },
  { date: '13/11', day: 'Sexta' },
];

export function scheduleDateSortKey(date: string): number {
  const [day, month] = date.split('/').map(Number);
  return month * 100 + day;
}
