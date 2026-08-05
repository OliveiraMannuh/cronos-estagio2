import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

// Datas de aula (Terça/Quarta/Sexta) transcritas da caderneta, ago-nov/2026
const CLASS_DATES = [
  '2026-08-18', '2026-08-19', '2026-08-21',
  '2026-08-25', '2026-08-26', '2026-08-28',
  '2026-09-01', '2026-09-02', '2026-09-04',
  '2026-09-08', '2026-09-09', '2026-09-11',
  '2026-09-15', '2026-09-16', '2026-09-18',
  '2026-09-22', '2026-09-23', '2026-09-25',
  '2026-09-29', '2026-09-30', '2026-10-02',
  '2026-10-06', '2026-10-07', '2026-10-09',
  '2026-10-13', '2026-10-14', '2026-10-16',
  '2026-10-20', '2026-10-21', '2026-10-23',
  '2026-10-27', '2026-10-28', '2026-10-30',
  '2026-11-03', '2026-11-04', '2026-11-06',
  '2026-11-10', '2026-11-11',
];

const CLASS_DATES_BY_MONTH = CLASS_DATES.reduce<Record<string, string[]>>((acc, iso) => {
  const monthKey = iso.slice(0, 7);
  (acc[monthKey] ??= []).push(iso);
  return acc;
}, {});

export const ClassSchedule: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="bg-[#00B37E] p-3 rounded-2xl text-white shadow-md shadow-[#00B37E]/20">
          <CalendarIcon size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cronograma de Aulas</h1>
          <p className="text-slate-500 text-sm">Datas de aula (Terça / Quarta / Sexta), ainda sem preenchimento — apenas as datas e o mês de referência.</p>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-6">
        {Object.entries(CLASS_DATES_BY_MONTH).map(([monthKey, isoDates]) => {
          const monthLabel = new Date(`${monthKey}-01T12:00:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
          return (
            <div key={monthKey}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-2 capitalize">{monthLabel}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {isoDates.map(iso => {
                  const date = new Date(`${iso}T12:00:00`);
                  return (
                    <div
                      key={iso}
                      className="p-3 rounded-xl border border-slate-200 border-dashed bg-white flex flex-col items-center justify-center text-center"
                    >
                      <div className="font-bold text-slate-800 text-sm">{date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-medium capitalize">{date.toLocaleDateString('pt-BR', { weekday: 'short' })}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
