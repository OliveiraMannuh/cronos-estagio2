import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Users, GraduationCap, Building2 } from 'lucide-react';

interface InstituicaoPageProps {
  onBack: () => void;
}

export const InstituicaoPage: React.FC<InstituicaoPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-[#B19470]/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-[#FDFCFB]/80 backdrop-blur-md border-b border-[#1A1A1A]/5">
        <div className="flex items-center gap-2">
          <img src="logo.png" alt="Cronos Estágio" className="w-16 h-16 object-contain" />
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
              Escola Parceira
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-serif font-medium leading-[0.95] tracking-tighter mb-6"
          >
            A <span className="italic">Instituição</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-[#7A7A7A] max-w-2xl leading-relaxed font-light"
          >
            O espaço que acolheu a prática docente e tornou possível a experiência do estágio supervisionado em ensino de Letras.
          </motion.p>
        </header>

        <div className="border-t border-[#1A1A1A]/5 mb-12 sm:mb-16" />

        {/* Instituição de Ensino */}
        <section className="mb-12 sm:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl font-serif mb-4 leading-tight">Escola Campo de Estágio</h2>
              <div className="space-y-4 text-[#4A4A4A] leading-relaxed font-light">
                <p>
                  O estágio supervisionado foi realizado em uma instituição de ensino da rede pública, em turmas do Ensino Fundamental II e Médio, com foco na disciplina de Língua Portuguesa e Literatura.
                </p>
                <p>
                  O ambiente escolar possibilitou o contato direto com a diversidade do corpo estudantil, os desafios da gestão de sala e a aplicação de metodologias ativas no ensino da língua.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-sm text-[#4A4A4A]">
                  <MapPin size={15} className="text-[#B19470] flex-shrink-0" />
                  <span>Rede Pública Estadual</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#4A4A4A]">
                  <Users size={15} className="text-[#B19470] flex-shrink-0" />
                  <span>Turmas do Ensino Fundamental II e Médio</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#4A4A4A]">
                  <GraduationCap size={15} className="text-[#B19470] flex-shrink-0" />
                  <span>Disciplina: Língua Portuguesa e Literatura</span>
                </div>
              </div>
            </div>

            <div className="bg-[#F5F0EB] rounded-2xl p-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#B19470] font-bold mb-6">Dados do Estágio</p>
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-[#1A1A1A]/5 pb-4">
                  <span className="text-sm text-[#7A7A7A]">Carga Horária Total</span>
                  <span className="font-serif text-2xl">36h</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#1A1A1A]/5 pb-4">
                  <span className="text-sm text-[#7A7A7A]">Nível de Ensino</span>
                  <span className="text-sm font-medium">Ensino Fundamental II e Médio</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#1A1A1A]/5 pb-4">
                  <span className="text-sm text-[#7A7A7A]">Modalidade</span>
                  <span className="text-sm font-medium">Presencial</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#7A7A7A]">Período</span>
                  <span className="text-sm font-medium">Março de 2026 - Junho de 2026</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Instituição Formadora */}
        <section className="bg-[#1A1A1A] text-white rounded-2xl sm:rounded-[32px] p-8 sm:p-12 mb-12 sm:mb-16">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#B19470]/20 flex items-center justify-center flex-shrink-0">
              <Building2 size={18} className="text-[#B19470]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#B19470] font-bold mb-1">Instituição Formadora</p>
              <h2 className="text-2xl font-serif leading-tight">Curso de Letras</h2>
            </div>
          </div>
          <div className="space-y-4 text-white/70 leading-relaxed font-light max-w-2xl">
            <p>
              O estágio supervisionado é componente curricular obrigatório do curso de Licenciatura em Letras, tendo por objetivo proporcionar ao licenciando a experiência da prática docente em contexto real de ensino.
            </p>
            <p>
              A supervisão acadêmica garante a articulação entre a teoria estudada no curso e a prática vivenciada na escola campo, promovendo a formação crítica e reflexiva do futuro professor.
            </p>
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
