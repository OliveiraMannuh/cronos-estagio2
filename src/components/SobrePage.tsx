import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Target, FileText, Clock } from 'lucide-react';

interface SobrePageProps {
  onBack: () => void;
}

export const SobrePage: React.FC<SobrePageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-[#B19470]/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-[#FDFCFB]/80 backdrop-blur-md border-b border-[#1A1A1A]/5">
        <div className="flex items-center gap-2">
          <img src="/cronos_estagio/logo.png" alt="Cronos Estágio" className="w-16 h-16 object-contain" />
          <span className="font-serif font-semibold tracking-tight text-xl">Cronos Estágio</span>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#7A7A7A] hover:text-[#1A1A1A] text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
      </nav>

      <main className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4"
          >
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#B19470] font-bold">
              O Projeto
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-serif font-medium leading-[0.95] tracking-tighter mb-6"
          >
            Sobre o <span className="italic">Cronos Estágio</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-[#7A7A7A] max-w-2xl leading-relaxed font-light"
          >
            Uma plataforma de documentação pedagógica desenvolvida para registrar, organizar e refletir sobre a prática docente durante o estágio supervisionado.
          </motion.p>
        </header>

        {/* Divisor */}
        <div className="border-t border-[#1A1A1A]/5 mb-12 sm:mb-16" />

        {/* O que é */}
        <section className="mb-12 sm:mb-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl font-serif mb-4 leading-tight">O que é este projeto?</h2>
            <div className="space-y-4 text-[#4A4A4A] leading-relaxed font-light">
              <p>
                O <strong className="font-medium text-[#1A1A1A]">Cronos Estágio</strong> é um sistema de portfólio digital desenvolvido por estudantes do curso de Letras para documentar as atividades realizadas durante o estágio supervisionado obrigatório.
              </p>
              <p>
                A plataforma centraliza registros de aulas, observações pedagógicas, fotografias e relatórios, criando um acervo reflexivo da trajetória docente.
              </p>
              <p>
                Cada entrada é registrada com data, carga horária e descrição detalhada, permitindo o acompanhamento em tempo real do progresso em direção à meta de <strong className="font-medium text-[#1A1A1A]">36 horas</strong> de estágio.
              </p>
            </div>
          </div>
          <div className="bg-[#F5F0EB] rounded-2xl p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#B19470]/20 flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-[#B19470]" />
              </div>
              <div>
                <p className="font-medium text-sm mb-1">Monitoramento de Horas</p>
                <p className="text-sm text-[#7A7A7A] font-light">Controle automático da carga horária cumprida e restante.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#B19470]/20 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-[#B19470]" />
              </div>
              <div>
                <p className="font-medium text-sm mb-1">Relatórios Síncronos</p>
                <p className="text-sm text-[#7A7A7A] font-light">Integração com Google Docs para exportação automática de relatórios.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#B19470]/20 flex items-center justify-center flex-shrink-0">
                <BookOpen size={18} className="text-[#B19470]" />
              </div>
              <div>
                <p className="font-medium text-sm mb-1">Galeria Pedagógica</p>
                <p className="text-sm text-[#7A7A7A] font-light">Registro fotográfico das atividades realizadas em sala de aula.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#B19470]/20 flex items-center justify-center flex-shrink-0">
                <Target size={18} className="text-[#B19470]" />
              </div>
              <div>
                <p className="font-medium text-sm mb-1">Reflexão Docente</p>
                <p className="text-sm text-[#7A7A7A] font-light">Espaço para anotações reflexivas sobre cada experiência em sala.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Motivação */}
        <section className="bg-[#1A1A1A] text-white rounded-2xl sm:rounded-[32px] p-8 sm:p-12 mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-serif mb-6 leading-tight">Por que documentar?</h2>
          <div className="space-y-4 text-white/70 leading-relaxed font-light max-w-2xl">
            <p>
              A prática reflexiva é um dos pilares da formação docente. Registrar cada aula, cada dificuldade e cada conquista permite uma análise crítica do próprio desenvolvimento profissional.
            </p>
            <p>
              O estágio supervisionado é o primeiro contato com a realidade da sala de aula, e documentá-lo com rigor é a forma mais honesta de compreender a complexidade do ato de ensinar.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#B19470] font-bold">Meta do Projeto</p>
            <p className="text-3xl font-serif mt-2">36 horas <span className="text-white/40 text-lg font-light">de estágio documentadas</span></p>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-[#1A1A1A]/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[#ABABAB] text-[10px]">
          <span>© 2026 Cronos Estágio. Todos os direitos reservados.</span>
          <span className="italic">Curso de Letras · Portfólio de Estágio Supervisionado</span>
        </footer>
      </main>
    </div>
  );
};
