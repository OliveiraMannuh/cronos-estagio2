import React from 'react';
import { motion } from 'motion/react';
import { LogIn, ArrowRight, BookOpen, Clock, FileText, Loader2 } from 'lucide-react';
import { InteractiveGallery } from './InteractiveGallery';

interface LandingPageProps {
  onLogin: () => void;
  onViewGallery: () => void;
  isLoggingIn: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onViewGallery, isLoggingIn }) => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-[#B19470]/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 bg-[#FDFCFB]/80 backdrop-blur-md border-bottom border-[#1A1A1A]/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
            <span className="text-white font-serif font-bold text-lg">C</span>
          </div>
          <span className="font-serif font-semibold tracking-tight">Cronos Estágio</span>
        </div>
        <button
          onClick={onLogin}
          disabled={isLoggingIn}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingIn ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogIn size={16} />
          )}
          {isLoggingIn ? 'Acessando...' : 'Acessar Sistema'}
        </button>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        {/* Hero Section */}
        <header className="mb-24 relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4"
          >
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#B19470] font-bold">
              Portfólio Acadêmico
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-serif font-medium leading-[0.9] tracking-tighter mb-8"
          >
            A Prática da Linguagem no <span className="italic">Ensino de Letras</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-[#7A7A7A] max-w-2xl leading-relaxed font-light"
          >
            Uma documentação sistemática e reflexiva sobre a jornada docente, 
            transformando cada hora de estágio em um registro de evolução pedagógica.
          </motion.p>
        </header>

        {/* Stats Summary */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 border-y border-[#1A1A1A]/5 py-12">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#B19470] mb-2">
              <Clock size={18} />
              <span className="text-xs uppercase tracking-widest font-bold">Carga Horária</span>
            </div>
            <p className="text-4xl font-serif">36 Horas</p>
            <p className="text-sm text-[#7A7A7A]">Dedicadas ao aperfeiçoamento constante das habilidades docentes.</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#B19470] mb-2">
              <FileText size={18} />
              <span className="text-xs uppercase tracking-widest font-bold">Relatórios</span>
            </div>
            <p className="text-4xl font-serif">Síncronos</p>
            <p className="text-sm text-[#7A7A7A]">Documentação em tempo real via Google Docs e integração em nuvem.</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#B19470] mb-2">
              <BookOpen size={18} />
              <span className="text-xs uppercase tracking-widest font-bold">Foco</span>
            </div>
            <p className="text-4xl font-serif">Letras</p>
            <p className="text-sm text-[#7A7A7A]">Análise linguística e prática reflexiva no ambiente escolar.</p>
          </div>
        </section>

        {/* About / Summary Section */}
        <section className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="sticky top-32">
            <h2 className="text-3xl font-serif mb-6 leading-tight">
              O Relato de uma <br />
              <span className="italic">Jornada Literária</span>
            </h2>
            <div className="space-y-6 text-[#4A4A4A] leading-relaxed text-lg font-light">
              <p>
                Este projeto de estágio não foi apenas o cumprimento de uma grade curricular, mas um mergulho profundo na realidade das salas de aula. 
                Aqui, a teoria encontra a caneta e o papel, revelando a complexidade do ensino da língua.
              </p>
              <p>
                Através deste sistema de monitoramento, cada interação, plano de aula e observação foi catalogada com rigor, permitindo uma visão panorâmica 
                do crescimento profissional em tempo real.
              </p>
              <button
                onClick={onViewGallery}
                className="group flex items-center gap-2 text-[#1A1A1A] font-medium border-b border-[#1A1A1A] pb-1 hover:text-[#B19470] hover:border-[#B19470] transition-all"
              >
                Ver registros completos
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          <div className="space-y-12">
            <InteractiveGallery />
          </div>
        </section>

        {/* Impact Phrase Section */}
        <section className="bg-[#1A1A1A] text-white rounded-[32px] p-12 md:p-20 text-center mb-20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="grid grid-cols-6 h-full border-l border-white/20">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border-r border-white/20 h-full" />
              ))}
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative z-10"
          >
            <h3 className="text-3xl md:text-5xl font-serif italic mb-8 max-w-4xl mx-auto leading-tight">
              "A educação não muda o mundo. A educação muda as pessoas. As pessoas mudam o mundo."
            </h3>
            <div className="w-12 h-px bg-[#B19470]/50 mx-auto mb-4" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">
              Paulo Freire
            </p>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="pt-20 border-t border-[#1A1A1A]/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[#7A7A7A] text-xs">
            © 2026 Cronos Estágio. Desenvolvido por Estudantes de Letras.
          </div>
          <div className="flex gap-8 text-[#7A7A7A] text-[10px] items-center uppercase tracking-widest font-bold">
            <span className="hover:text-[#1A1A1A] cursor-pointer">Privacidade</span>
            <span className="hover:text-[#1A1A1A] cursor-pointer">Termos</span>
            <span className="hover:text-[#1A1A1A] cursor-pointer">Suporte</span>
          </div>
        </footer>
      </main>
    </div>
  );
};
