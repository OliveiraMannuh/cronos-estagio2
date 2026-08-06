import React, { useEffect, useMemo, useState } from 'react';
import { NotebookPen, ChevronDown, Plus, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PLANNING_LESSONS, PlanningLesson, PlanningSubject } from '../data/classPlanning';
import { SCHEDULE_DATES, scheduleDateSortKey } from '../data/scheduleDates';
import { formatPlanningText } from '../utils/formatPlanningText';

type Tab = 'geral' | PlanningSubject;

const TAB_OPTIONS: { id: Tab; label: string }[] = [
  { id: 'geral', label: 'Geral' },
  { id: 'interpretacao', label: 'Interpretação de Texto' },
  { id: 'redacao', label: 'Redação' },
];

const STORAGE_KEY = 'classPlanningCustomLessons';

function loadCustomLessons(): PlanningLesson[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomLessons(lessons: PlanningLesson[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
}

const markdownComponents = {
  h1: (props: any) => <h1 className="text-xl font-bold text-slate-900 mt-6 mb-3" {...props} />,
  h2: (props: any) => <h2 className="text-lg font-bold text-slate-900 mt-6 mb-3" {...props} />,
  h3: (props: any) => <h3 className="text-base font-bold text-slate-800 mt-5 mb-2" {...props} />,
  h4: (props: any) => <h4 className="text-sm font-bold text-slate-800 mt-4 mb-2" {...props} />,
  p: (props: any) => <p className="text-sm text-slate-600 leading-relaxed mb-3" {...props} />,
  strong: (props: any) => <strong className="font-bold text-slate-800" {...props} />,
  a: (props: any) => (
    <a className="text-[#00B37E] underline hover:text-[#00966b]" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  ul: (props: any) => <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 mb-3 ml-1" {...props} />,
  ol: (props: any) => <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 mb-3 ml-1" {...props} />,
  li: (props: any) => <li className="leading-relaxed" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-[#00B37E]/40 bg-slate-50 rounded-r-lg px-4 py-2 my-3 text-sm text-slate-700 italic" {...props} />
  ),
  table: (props: any) => (
    <div className="overflow-x-auto my-3">
      <table className="w-full text-sm border-collapse" {...props} />
    </div>
  ),
  thead: (props: any) => <thead {...props} />,
  th: (props: any) => (
    <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 py-2 px-3" {...props} />
  ),
  td: (props: any) => <td className="py-2 px-3 text-slate-600 border-b border-slate-100 align-top" {...props} />,
  hr: () => <hr className="border-slate-200 my-6" />,
  code: (props: any) => <code className="bg-slate-100 text-slate-700 rounded px-1.5 py-0.5 text-xs" {...props} />,
};

const emptyForm = {
  subject: 'interpretacao' as PlanningSubject,
  date: SCHEDULE_DATES[0]?.date ?? '',
  title: '',
  raw: '',
};

export const ClassPlanning: React.FC = () => {
  const [tab, setTab] = useState<Tab>('geral');
  const [openLesson, setOpenLesson] = useState<string | null>(`${PLANNING_LESSONS[0]?.date}-${PLANNING_LESSONS[0]?.subject}`);
  const [customLessons, setCustomLessons] = useState<PlanningLesson[]>(() => loadCustomLessons());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    saveCustomLessons(customLessons);
  }, [customLessons]);

  const allLessons = useMemo(() => {
    const merged = [...PLANNING_LESSONS];
    customLessons.forEach(custom => {
      const idx = merged.findIndex(l => l.date === custom.date && l.subject === custom.subject);
      if (idx >= 0) merged[idx] = custom;
      else merged.push(custom);
    });
    return merged.sort((a, b) => scheduleDateSortKey(a.date) - scheduleDateSortKey(b.date));
  }, [customLessons]);

  const lessons = tab === 'geral' ? allLessons : allLessons.filter(l => l.subject === tab);

  const toggleLesson = (key: string) => {
    setOpenLesson(prev => (prev === key ? null : key));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.title.trim() || !form.raw.trim()) return;

    const day = SCHEDULE_DATES.find(d => d.date === form.date)?.day ?? '';
    const markdown = formatPlanningText(form.raw, form.title);

    const newLesson: PlanningLesson = {
      date: form.date,
      day,
      subject: form.subject,
      title: form.title.trim(),
      markdown,
    };

    setCustomLessons(prev => {
      const idx = prev.findIndex(l => l.date === newLesson.date && l.subject === newLesson.subject);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newLesson;
        return next;
      }
      return [...prev, newLesson];
    });

    setOpenLesson(`${newLesson.date}-${newLesson.subject}`);
    setTab(newLesson.subject);
    setForm(emptyForm);
    setShowForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="bg-[#00B37E] p-3 rounded-2xl text-white shadow-md shadow-[#00B37E]/20 self-start">
          <NotebookPen size={28} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Planejamento de Aulas</h1>
          <p className="text-slate-500 text-sm mt-1">
            <strong className="text-slate-700">Turma:</strong> CEJA — 6º ano ao 3º ano do Ensino Médio
          </p>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            Planos de aula detalhados, seguindo as mesmas datas do cronograma. Cada plano traz objetivos, desenvolvimento
            da aula, diferenciação para a turma multisseriada e avaliação formativa.
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center justify-center gap-2 bg-[#0F172A] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors shrink-0"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancelar' : 'Cadastrar aula'}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Disciplina</label>
              <select
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value as PlanningSubject }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00B37E]/30"
              >
                <option value="interpretacao">Interpretação de Texto</option>
                <option value="redacao">Redação</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Data (cronograma)</label>
              <select
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00B37E]/30"
              >
                {SCHEDULE_DATES.map(d => (
                  <option key={d.date} value={d.date}>
                    {d.date} — {d.day}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Título da aula</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Ex.: Leitura x interpretação: decodificar, compreender e inferir"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00B37E]/30"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Texto do planejamento (cole aqui — será formatado automaticamente)
            </label>
            <textarea
              value={form.raw}
              onChange={e => setForm(f => ({ ...f, raw: e.target.value }))}
              rows={10}
              placeholder="Cole o texto do plano de aula. Linhas como &quot;Tema: ...&quot;, &quot;1. Objetivos da aula&quot; ou &quot;Etapa 1 — ...&quot; são reconhecidas e formatadas automaticamente."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-[#00B37E]/30"
              required
            />
          </div>

          {form.raw.trim() && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Pré-visualização formatada</div>
              <div className="border border-slate-100 rounded-lg p-4 bg-slate-50 max-h-64 overflow-y-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {formatPlanningText(form.raw, form.title)}
                </ReactMarkdown>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm);
                setShowForm(false);
              }}
              className="px-4 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-full text-sm font-bold text-white bg-[#00B37E] hover:bg-[#00966b] transition-colors"
            >
              Salvar plano de aula
            </button>
          </div>
        </form>
      )}

      <div className="flex gap-2 mb-6">
        {TAB_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setTab(opt.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors border ${
              tab === opt.id
                ? 'bg-[#0F172A] text-white border-transparent'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {lessons.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-sm text-slate-500">
            Ainda não há planos de aula cadastrados para esta disciplina.
          </div>
        )}

        {lessons.map(lesson => {
          const key = `${lesson.date}-${lesson.subject}`;
          const isOpen = openLesson === key;
          return (
            <div key={key} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleLesson(key)}
                className="w-full flex items-center gap-4 p-4 sm:p-6 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="text-center shrink-0">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{lesson.day}</div>
                  <div className="text-lg font-bold text-slate-900">{lesson.date}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 ${
                      lesson.subject === 'interpretacao'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-sky-50 text-sky-700'
                    }`}
                  >
                    {lesson.subject === 'interpretacao' ? 'Interpretação de Texto' : 'Redação'}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 truncate">{lesson.title}</h3>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 p-4 sm:p-6 pt-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {lesson.markdown}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
