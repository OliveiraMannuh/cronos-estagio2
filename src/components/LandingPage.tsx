import React from 'react';
import { motion } from 'motion/react';
import { LogIn, Loader2, Hammer } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onViewGallery: () => void;
  onViewSobre: () => void;
  onViewInstituicao: () => void;
  onViewContato: () => void;
  isLoggingIn: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, isLoggingIn }) => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-[#B19470]/20 flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-[#FDFCFB]/80 backdrop-blur-md border-b border-[#1A1A1A]/5">
        <div className="flex items-center gap-2">
          <img src="/cronos_estagio/logo.png" alt="Cronos Estágio" className="w-16 h-16 object-contain" />
          <span className="font-serif font-semibold tracking-tight text-xl">Cronos Estágio</span>
        </div>
        <button
          onClick={onLogin}
          disabled={isLoggingIn}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingIn ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogIn size={16} />
          )}
          {isLoggingIn ? 'Acessando...' : 'Acessar Sistema'}
        </button>
      </nav>

      <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-8 text-[#B19470]"
          >
            <Hammer size={64} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-serif font-medium mb-4"
          >
            Página em Construção
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#7A7A7A] max-w-md mx-auto"
          >
            Estamos trabalhando para trazer novidades. Por favor, acesse o sistema para continuar.
          </motion.p>
        </div>
      </main>
    </div>
  );
};
