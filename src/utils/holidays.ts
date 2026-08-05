export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  scope: 'nacional' | 'estadual' | 'municipal';
}

// Algoritmo de Gauss/Anonymous Gregorian para calcular a data da Páscoa
function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day, 12, 0, 0);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Feriados nacionais (fixos + móveis) e feriados estadual (CE) / municipal (Fortaleza).
// Datas estaduais/municipais são fixas por lei e não seguem fórmula, por isso ficam
// mantidas explicitamente aqui.
export function getBrazilianHolidays(year: number): Holiday[] {
  const easter = getEasterDate(year);

  return [
    // Nacionais fixos
    { date: `${year}-01-01`, name: 'Confraternização Universal', scope: 'nacional' },
    { date: `${year}-04-21`, name: 'Tiradentes', scope: 'nacional' },
    { date: `${year}-05-01`, name: 'Dia do Trabalho', scope: 'nacional' },
    { date: `${year}-09-07`, name: 'Independência do Brasil', scope: 'nacional' },
    { date: `${year}-10-12`, name: 'Nossa Senhora Aparecida', scope: 'nacional' },
    { date: `${year}-11-02`, name: 'Finados', scope: 'nacional' },
    { date: `${year}-11-15`, name: 'Proclamação da República', scope: 'nacional' },
    { date: `${year}-11-20`, name: 'Consciência Negra', scope: 'nacional' },
    { date: `${year}-12-25`, name: 'Natal', scope: 'nacional' },
    // Móveis (baseados na Páscoa)
    { date: toISODate(addDays(easter, -48)), name: 'Carnaval (segunda-feira)', scope: 'nacional' },
    { date: toISODate(addDays(easter, -47)), name: 'Carnaval (terça-feira)', scope: 'nacional' },
    { date: toISODate(addDays(easter, -2)), name: 'Sexta-feira Santa', scope: 'nacional' },
    { date: toISODate(addDays(easter, 60)), name: 'Corpus Christi', scope: 'nacional' },
    // Estadual - Ceará
    { date: `${year}-03-25`, name: 'Abolição da Escravatura no Ceará', scope: 'estadual' },
    // Municipal - Fortaleza
    { date: `${year}-08-15`, name: 'Nossa Senhora da Assunção (Padroeira de Fortaleza)', scope: 'municipal' },
  ];
}

export function getHolidaysInRange(startYear: number, endYear: number): Map<string, Holiday> {
  const map = new Map<string, Holiday>();
  for (let y = startYear; y <= endYear; y++) {
    for (const holiday of getBrazilianHolidays(y)) {
      map.set(holiday.date, holiday);
    }
  }
  return map;
}
