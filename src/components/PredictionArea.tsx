import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Share2,
  RotateCcw,
  TrendingUp,
  Award,
  Settings2,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

const WEEKDAYS = [
  { id: 1, label: 'Seg', name: 'Segunda-feira' },
  { id: 2, label: 'Ter', name: 'Terça-feira' },
  { id: 3, label: 'Qua', name: 'Quarta-feira' },
  { id: 4, label: 'Qui', name: 'Quinta-feira' },
  { id: 5, label: 'Sex', name: 'Sexta-feira' },
  { id: 6, label: 'Sáb', name: 'Sábado' },
  { id: 0, label: 'Dom', name: 'Domingo' },
];

export const PredictionArea: React.FC = () => {
  const [goalHours, setGoalHours] = useState<number>(72);
  const [completedHours, setCompletedHours] = useState<number>(0);
  const [hoursPerDay, setHoursPerDay] = useState<number>(6);
  const [startDate, setStartDate] = useState<string>('2026-05-21');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Seg-Sex
  const [activeTab, setActiveTab] = useState<'schedule' | 'analysis'>('schedule');

  const toggleDay = (dayId: number) => {
    setSelectedDays(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId].sort()
    );
  };

  // Quick select functions
  const setWeekdays = () => setSelectedDays([1, 2, 3, 4, 5]);
  const setMonWedFri = () => setSelectedDays([1, 3, 5]);
  const setWeekends = () => setSelectedDays([0, 6]);
  const setAllDays = () => setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
  
  const resetParams = () => {
    setGoalHours(72);
    setCompletedHours(0);
    setHoursPerDay(6);
    setStartDate('2026-05-21');
    setWeekdays();
  };

  const timeline = useMemo(() => {
    if (selectedDays.length === 0 || hoursPerDay <= 0 || goalHours <= completedHours) {
      return [];
    }

    // Set time to midday to avoid timezone edge cases when adding days
    let current = new Date(startDate + 'T12:00:00');
    let accum = completedHours;
    const result = [];
    let dayCount = 1;

    // Safety limit of 365 days max calculation
    let iterations = 0;
    while (accum < goalHours && iterations < 365) {
      if (selectedDays.includes(current.getDay())) {
        const needed = goalHours - accum;
        const hoursToday = Math.min(hoursPerDay, needed);
        accum += hoursToday;
        
        result.push({
          index: dayCount++,
          date: new Date(current),
          hours: hoursToday,
          accumulated: accum
        });
      }
      current.setDate(current.getDate() + 1);
      iterations++;
    }
    return result;
  }, [goalHours, completedHours, hoursPerDay, startDate, selectedDays]);

  const lastDay = timeline.length > 0 ? timeline[timeline.length - 1] : null;
  const calendarDays = lastDay 
    ? Math.ceil((lastDay.date.getTime() - new Date(startDate + 'T12:00:00').getTime()) / (1000 * 3600 * 24)) + 1 
    : 0;
  const remainingHours = Math.max(0, goalHours - completedHours);
  const progressPercent = Math.min(100, Math.max(0, (completedHours / goalHours) * 100)) || 0;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="bg-[#00B37E] p-3 rounded-2xl text-white shadow-md shadow-[#00B37E]/20">
            <Award size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Previsor de Estágio</h1>
            <p className="text-slate-500 text-sm">Desenvolva seu plano para completar as {goalHours}h de estágio</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={resetParams} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-medium text-sm"
          >
            <RotateCcw size={16} /> Resetar para 72h
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-[#00B37E] text-white rounded-lg hover:bg-[#009669] transition-colors font-medium text-sm shadow-md shadow-[#00B37E]/20"
          >
            <Share2 size={16} /> Compartilhar
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Ajustar Parâmetros */}
        <div className="xl:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-lg mb-6 pb-4 border-b border-slate-100">
            <Settings2 size={20} className="text-slate-400" />
            Ajustar Parâmetros
          </div>

          <div className="space-y-8 flex-1 overflow-auto pr-2">
            {/* Meta de Horas */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Award size={16} className="text-[#00B37E]" /> Meta de Horas do Estágio
                </label>
                <div className="px-2 py-1 bg-green-50 text-[#00B37E] text-xs font-bold rounded-md">{goalHours} horas</div>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="1" 
                  max="300" 
                  value={goalHours} 
                  onChange={(e) => setGoalHours(Number(e.target.value))} 
                  className="flex-1 accent-[#00B37E] h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer" 
                />
                <input 
                  type="number" 
                  value={goalHours} 
                  onChange={(e) => setGoalHours(Number(e.target.value))} 
                  className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-center font-medium text-sm focus:border-[#00B37E] focus:ring-1 focus:ring-[#00B37E] outline-none" 
                />
              </div>
            </div>

            {/* Horas Concluídas */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CheckCircle2 size={16} className="text-slate-400" /> Horas Concluídas (Já realizadas)
                </label>
                <div className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">{completedHours}h de {goalHours}h</div>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" 
                  max={goalHours} 
                  value={completedHours} 
                  onChange={(e) => setCompletedHours(Number(e.target.value))} 
                  className="flex-1 accent-slate-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer" 
                />
                <input 
                  type="number" 
                  value={completedHours} 
                  onChange={(e) => setCompletedHours(Number(e.target.value))} 
                  className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-center font-medium text-sm focus:border-slate-500 outline-none" 
                />
              </div>
              
              {/* Progress Bar */}
              <div className="bg-slate-50 p-4 rounded-xl mt-4 border border-slate-100">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                  <span>Progresso do Estágio</span>
                  <span className="text-[#00B37E]">{Math.round(progressPercent)}% Concluído</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="h-full bg-[#00B37E]" 
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>{completedHours}h realizadas</span>
                  <span>Faltam {remainingHours}h</span>
                </div>
              </div>
            </div>

            {/* Carga Horária por Dia */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Clock size={16} className="text-blue-500" /> Carga Horária por Dia Ativo
                </label>
                <div className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-md">{hoursPerDay} horas/dia</div>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="1" 
                  max="24" 
                  value={hoursPerDay} 
                  onChange={(e) => setHoursPerDay(Number(e.target.value))} 
                  className="flex-1 accent-blue-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer" 
                />
                <input 
                  type="number" 
                  value={hoursPerDay} 
                  onChange={(e) => setHoursPerDay(Number(e.target.value))} 
                  className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-center font-medium text-sm focus:border-blue-500 outline-none" 
                />
              </div>
            </div>

            {/* Data de Início */}
            <div className="pt-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <CalendarIcon size={16} className="text-purple-500" /> Data de Início das Atividades
              </label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-shadow" 
              />
            </div>

            {/* Dias da semana */}
            <div className="pt-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <CalendarIcon size={16} className="text-indigo-500" /> Quais dias da semana fará estágio?
              </label>
              <div className="flex gap-1.5 mb-3">
                {WEEKDAYS.map(day => (
                  <button 
                    key={day.id} 
                    onClick={() => toggleDay(day.id)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                      selectedDays.includes(day.id) 
                        ? 'bg-[#0F172A] text-white border-transparent' 
                        : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={setWeekdays} className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase transition-colors">Seg a Sex</button>
                <button onClick={setMonWedFri} className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase transition-colors">Seg / Qua / Sex</button>
                <button onClick={setWeekends} className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase transition-colors">Finais de Semana</button>
                <button onClick={setAllDays} className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase transition-colors">Todos os dias</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Cards */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* Top Dark Card */}
          <div className="bg-[#0F172A] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10 shrink-0">
            <CalendarIcon size={240} className="absolute -right-12 -bottom-16 text-white/5 pointer-events-none transform -rotate-12" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00B37E]/10 text-[#00B37E] rounded-full text-xs font-bold mb-6 border border-[#00B37E]/20">
                <TrendingUp size={14} /> Previsão de Conclusão Estimada
              </div>
              
              {lastDay ? (
                <>
                  <h2 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight">
                    {lastDay.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </h2>
                  <p className="text-slate-400 text-sm md:text-base mb-8 max-w-xl leading-relaxed">
                    No último dia de estágio (um <strong className="text-white capitalize">{lastDay.date.toLocaleDateString('pt-BR', { weekday: 'long' })}</strong>), você precisará fazer apenas <strong className="text-[#00B37E]">{lastDay.hours}h</strong> para fechar a meta!
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight text-slate-300">Sem Previsão</h2>
                  <p className="text-slate-400 text-sm md:text-base mb-8 max-w-xl leading-relaxed">
                    Ajuste os parâmetros ou adicione dias da semana para calcular a data estimada de conclusão.
                  </p>
                </>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
                    <Clock size={14} className="text-orange-400" /> Dias de Estágio Ativos
                  </div>
                  <div className="text-2xl font-bold text-white">{timeline.length} <span className="text-sm font-normal text-slate-400">dias úteis</span></div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
                    <CalendarIcon size={14} className="text-blue-400" /> Tempo Calendário Total
                  </div>
                  <div className="text-2xl font-bold text-white">{calendarDays} <span className="text-sm font-normal text-slate-400">dias corridos</span></div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
                    <Clock size={14} className="text-purple-400" /> Carga Horária Restante
                  </div>
                  <div className="text-2xl font-bold text-white">{remainingHours} <span className="text-sm font-normal text-slate-400">horas</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Card: Timeline & Analysis */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 min-h-[400px]">
            <div className="flex border-b border-slate-100 px-2 sm:px-6 pt-2">
              <button 
                onClick={() => setActiveTab('schedule')}
                className={`px-4 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'schedule' ? 'border-[#00B37E] text-[#00B37E]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                <CalendarIcon size={16} /> Cronograma Dia a Dia 
                <span className={`px-2 py-0.5 rounded-full text-[10px] ml-1 ${activeTab === 'schedule' ? 'bg-[#00B37E]/10 text-[#00B37E]' : 'bg-slate-100 text-slate-500'}`}>
                  {timeline.length}
                </span>
              </button>
              <button 
                onClick={() => setActiveTab('analysis')}
                className={`px-4 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'analysis' ? 'border-[#00B37E] text-[#00B37E]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                <TrendingUp size={16} /> Análise Crítica & Dicas
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50/50 rounded-b-2xl">
              {activeTab === 'schedule' && (
                <>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
                    <span>Dia de Estágio</span>
                    <span>Horas / Progresso Acumulado</span>
                  </div>
                  
                  <div className="space-y-3">
                    {timeline.map((item, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                        key={idx} 
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-[#00B37E]/30 hover:shadow-md transition-all bg-white group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-50 text-slate-500 font-bold text-sm flex items-center justify-center rounded-xl border border-slate-100 group-hover:bg-[#00B37E]/5 group-hover:text-[#00B37E] group-hover:border-[#00B37E]/20 transition-colors shrink-0">
                            #{item.index}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{item.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                            <div className="text-xs text-slate-500 capitalize">{item.date.toLocaleDateString('pt-BR', { weekday: 'long' })}</div>
                          </div>
                        </div>
                        <div className="sm:text-right flex sm:block justify-between items-center sm:items-end w-full sm:w-auto border-t sm:border-0 border-slate-100 pt-3 sm:pt-0">
                          <div className="font-bold text-blue-600 bg-blue-50 sm:bg-transparent px-2 sm:px-0 py-1 sm:py-0 rounded-md">+{item.hours} horas</div>
                          <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-1">Acumulado: {item.accumulated}h / {goalHours}h</div>
                        </div>
                      </motion.div>
                    ))}
                    {timeline.length === 0 && (
                      <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">
                        <CalendarIcon size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="font-medium text-slate-600 mb-1">Nenhum dia calculado.</p>
                        <p className="text-sm">Ajuste a meta, adicione dias da semana ou verifique as horas concluídas.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {activeTab === 'analysis' && (
                <div className="space-y-4">
                  <div className="p-5 bg-blue-50 border border-blue-100 text-blue-900 rounded-2xl flex gap-4 items-start">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1 text-blue-900">Ritmo de Estágio</h4>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        Com sua configuração atual de <strong>{hoursPerDay}h por dia</strong> em <strong>{selectedDays.length} dias da semana</strong>, 
                        você precisará de <strong>{timeline.length} dias de estágio</strong> para concluir a meta de {goalHours}h. 
                        Isso levará cerca de <strong>{calendarDays} dias corridos</strong> a partir da data de início.
                      </p>
                    </div>
                  </div>
                  
                  {calendarDays > 180 && (
                    <div className="p-5 bg-amber-50 border border-amber-100 text-amber-900 rounded-2xl flex gap-4 items-start">
                      <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold mb-1 text-amber-900">Alerta de Longo Prazo</h4>
                        <p className="text-sm text-amber-800 leading-relaxed">
                          Sua previsão estende-se por mais de 6 meses. Considere aumentar a carga diária ou adicionar mais dias na semana se precisar concluir em um único semestre letivo.
                        </p>
                      </div>
                    </div>
                  )}

                  {hoursPerDay > 6 && (
                    <div className="p-5 bg-purple-50 border border-purple-100 text-purple-900 rounded-2xl flex gap-4 items-start">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg shrink-0">
                        <Lightbulb size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold mb-1 text-purple-900">Atenção à Legislação</h4>
                        <p className="text-sm text-purple-800 leading-relaxed">
                          Você configurou <strong>{hoursPerDay} horas/dia</strong>. Lembre-se que a Lei do Estágio (Lei nº 11.788/2008) estabelece o limite de 6 horas diárias e 30 horas semanais para estudantes de ensino superior, médio e educação especial.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {timeline.length > 0 && timeline.length <= 15 && (
                    <div className="p-5 bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-2xl flex gap-4 items-start">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold mb-1 text-emerald-900">Ritmo Acelerado</h4>
                        <p className="text-sm text-emerald-800 leading-relaxed">
                          Você concluirá suas horas muito rapidamente (em menos de 15 dias de atividades)! Excelente foco, apenas certifique-se de preencher todos os relatórios em dia.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
