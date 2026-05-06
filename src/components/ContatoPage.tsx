import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Linkedin, ExternalLink } from 'lucide-react';

interface ContatoPageProps {
  onBack: () => void;
}

const students = [
  {
    name: 'Nome do Aluno 1',
    role: 'Estagiário · Licenciatura em Letras',
    bio: 'Estudante do curso de Letras com interesse em análise linguística, literatura brasileira e metodologias ativas no ensino de língua portuguesa. Em processo de formação docente através do estágio supervisionado na rede pública de ensino.',
    linkedin: 'https://linkedin.com',
    lattes: 'https://lattes.cnpq.br',
    initials: 'A1',
  },
  {
    name: 'Nome do Aluno 2',
    role: 'Estagiária · Licenciatura em Letras',
    bio: 'Estudante de Letras com foco em práticas pedagógicas reflexivas, produção textual e leitura crítica. Desenvolve pesquisa sobre o ensino de literatura no Ensino Médio e participa ativamente do estágio supervisionado.',
    linkedin: 'https://linkedin.com',
    lattes: 'https://lattes.cnpq.br',
    initials: 'A2',
  },
];

export const ContatoPage: React.FC<ContatoPageProps> = ({ onBack }) => {
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
              Os Estagiários
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-serif font-medium leading-[0.95] tracking-tighter mb-6"
          >
            Quem está por <span className="italic">trás do projeto</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-[#7A7A7A] max-w-2xl leading-relaxed font-light"
          >
            Estudantes do curso de Letras em processo de formação docente, documentando cada passo da jornada pedagógica.
          </motion.p>
        </header>

        <div className="border-t border-[#1A1A1A]/5 mb-12 sm:mb-16" />

        {/* Cards dos alunos */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
          {students.map((student, index) => (
            <motion.div
              key={student.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.15 }}
              className="bg-[#F5F0EB] rounded-2xl p-8 flex flex-col gap-6"
            >
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#B19470]/30 flex items-center justify-center flex-shrink-0">
                  <span className="font-serif text-lg text-[#B19470] font-semibold">{student.initials}</span>
                </div>
                <div>
                  <p className="font-serif text-lg font-medium leading-tight">{student.name}</p>
                  <p className="text-[11px] text-[#7A7A7A] font-light mt-0.5">{student.role}</p>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-[#4A4A4A] leading-relaxed font-light flex-1">
                {student.bio}
              </p>

              {/* Links */}
              <div className="flex gap-3 pt-2 border-t border-[#1A1A1A]/5">
                <a
                  href={student.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors"
                >
                  <Linkedin size={13} />
                  LinkedIn
                </a>
                <span className="text-[#1A1A1A]/10">·</span>
                <a
                  href={student.lattes}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors"
                >
                  <ExternalLink size={13} />
                  Currículo Lattes
                </a>
              </div>
            </motion.div>
          ))}
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
