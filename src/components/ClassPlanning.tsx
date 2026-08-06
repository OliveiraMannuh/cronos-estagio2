import React, { useState } from 'react';
import { NotebookPen, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PLANNING_LESSONS, PlanningSubject } from '../data/classPlanning';

type Tab = 'geral' | PlanningSubject;

const TAB_OPTIONS: { id: Tab; label: string }[] = [
  { id: 'geral', label: 'Geral' },
  { id: 'interpretacao', label: 'Interpretação de Texto' },
  { id: 'redacao', label: 'Redação' },
];

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

export const ClassPlanning: React.FC = () => {
  const [tab, setTab] = useState<Tab>('geral');
  const [openLesson, setOpenLesson] = useState<string | null>(`${PLANNING_LESSONS[0]?.date}-${PLANNING_LESSONS[0]?.subject}`);

  const lessons =
    tab === 'geral' ? PLANNING_LESSONS : PLANNING_LESSONS.filter(l => l.subject === tab);

  const toggleLesson = (key: string) => {
    setOpenLesson(prev => (prev === key ? null : key));
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
      </header>

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
