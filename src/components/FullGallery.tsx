import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, ArrowLeft, LogIn, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryItem {
  id: number;
  url: string;
  phrase: string;
  category: string;
  description: string;
}

export const galleryItems: GalleryItem[] = [
  {
    id: 1,
    url: 'https://i.postimg.cc/SsLTKDX2/9f2eded6-18ba-4e99-ba9a-c36f2a19a02d.jpg',
    phrase: "A linguagem é a única pátria onde o saber se manifesta plenamente.",
    category: "Linguística",
    description: "Análise das estruturas fundamentais da comunicação humana durante as aulas de morfologia."
  },
  {
    id: 2,
    url: 'https://i.postimg.cc/DyNgntCN/bf021cac-df5e-4cf4-8975-d1098fc55c97.jpg',
    phrase: "Cada registro é um fragmento essencial da nossa jornada pedagógica.",
    category: "Prática Docente",
    description: "Documentação diária realizada na escola campo, transformando observação em aprendizado."
  },
  {
    id: 3,
    url: 'https://i.postimg.cc/5yrx2wkJ/Whats-App-Image-2026-05-02-at-13-00-29.jpg',
    phrase: "Arquivar o presente é garantir o futuro da memória institucional.",
    category: "Gestão",
    description: "Organização de acervos e relatórios acadêmicos para preservação da história escolar."
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1200',
    phrase: "Entre livros e relatórios, a prática docente ganha forma e propósito.",
    category: "Ensino",
    description: "O ambiente de sala de aula como laboratório vivo de experiências linguísticas."
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200',
    phrase: "A leitura do mundo precede a leitura da palavra.",
    category: "Alfabetização",
    description: "Inspirado em Paulo Freire, observando como o contexto social influencia o letramento."
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200',
    phrase: "O diálogo é o encontro dos homens que mediatizam o mundo.",
    category: "Colaboração",
    description: "Reuniões pedagógicas e trocas de experiências entre estagiários e professores regentes."
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=1200',
    phrase: "A escrita é o ensaio da eternidade no papel do agora.",
    category: "Produção Textual",
    description: "Oficinas de redação e correção comentada de produções literárias de alunos."
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1507733593714-724e615332c6?auto=format&fit=crop&q=80&w=1200',
    phrase: "Bibliotecas são templos de silêncio que gritam conhecimento.",
    category: "Pesquisa",
    description: "Horas dedicadas à pesquisa bibliográfica para fundamentação dos relatórios técnicos."
  }
];

interface FullGalleryProps {
  onBack: () => void;
  onLogin: () => void;
}

export const FullGallery: React.FC<FullGalleryProps> = ({ onBack, onLogin }) => {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const handleNext = () => {
    if (!selectedImage) return;
    const currentIndex = galleryItems.findIndex(item => item.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % galleryItems.length;
    setSelectedImage(galleryItems[nextIndex]);
  };

  const handlePrev = () => {
    if (!selectedImage) return;
    const currentIndex = galleryItems.findIndex(item => item.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    setSelectedImage(galleryItems[prevIndex]);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setSelectedImage(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans pb-20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-[#FDFCFB]/80 backdrop-blur-md border-b border-[#1A1A1A]/5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors group"
        >
          <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Voltar para início</span>
        </button>
        <button
          onClick={onLogin}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-black transition-all shadow-lg"
        >
          <LogIn size={16} />
          Acessar Painel
        </button>
      </nav>

      <main className="pt-24 sm:pt-32 px-4 sm:px-6 max-w-7xl mx-auto">
        <header className="mb-16 text-center max-w-2xl mx-auto">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] uppercase tracking-[0.4em] text-[#B19470] font-bold mb-4 block"
          >
            Galeria Digital
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-6xl font-serif mb-6"
          >
            Registros Visuais do <span className="italic">Estágio</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[#7A7A7A] leading-relaxed"
          >
            Uma curadoria de momentos capturados durante a vivência escolar, 
            unindo a imagem técnica à síntese teórica de nossos relatórios.
          </motion.p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {galleryItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedImage(item)}
              className="group relative aspect-[4/5] rounded-2xl sm:rounded-[32px] overflow-hidden cursor-pointer"
            >
              <img
                src={item.url}
                alt={item.category}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay with phrase on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-4 sm:p-8 flex flex-col justify-end">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold">
                    {item.category}
                  </span>
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                    <Maximize2 size={14} />
                  </div>
                </div>
                <p className="text-white text-sm sm:text-xl font-serif italic leading-snug">
                  "{item.phrase}"
                </p>
              </div>

              {/* Static Mobile info */}
              <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 md:hidden">
                <p className="text-white text-xs sm:text-sm font-serif italic drop-shadow-md">
                  "{item.phrase}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Lightbox / Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-[#FDFCFB]/95 backdrop-blur-xl"
          >
            <motion.button
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 sm:top-8 sm:right-8 z-[110] p-3 sm:p-4 bg-[#1A1A1A] text-white rounded-full hover:scale-110 active:scale-95 transition-all"
            >
              <X size={24} />
            </motion.button>

            {/* Navigation Buttons */}
            <div className="absolute inset-0 flex items-center justify-between px-4 md:px-12 pointer-events-none">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="pointer-events-auto p-2 sm:p-4 bg-white/80 backdrop-blur-md text-[#1A1A1A] rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl shadow-black/5"
              >
                <ChevronLeft size={20} className="sm:hidden" />
                <ChevronLeft size={32} className="hidden sm:block" />
              </motion.button>
              
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="pointer-events-auto p-2 sm:p-4 bg-white/80 backdrop-blur-md text-[#1A1A1A] rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl shadow-black/5"
              >
                <ChevronRight size={20} className="sm:hidden" />
                <ChevronRight size={32} className="hidden sm:block" />
              </motion.button>
            </div>

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12 items-center overflow-y-auto max-h-screen pt-16 sm:pt-20 pb-8 sm:pb-12 px-4 md:px-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:col-span-2 relative aspect-[4/3] md:aspect-[3/2] rounded-[24px] md:rounded-[40px] overflow-hidden shadow-2xl shadow-black/20"
              >
                <img
                  src={selectedImage.url}
                  alt={selectedImage.category}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col gap-8"
              >
                <div>
                  <span className="text-[11px] uppercase tracking-[0.4em] text-[#B19470] font-bold mb-4 block">
                    {selectedImage.category}
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-serif italic leading-tight mb-4 sm:mb-6">
                    "{selectedImage.phrase}"
                  </h2>
                  <p className="text-[#7A7A7A] leading-relaxed text-lg font-light">
                    {selectedImage.description}
                  </p>
                </div>
                
                <div className="h-px bg-[#1A1A1A]/10 w-12" />
                
                <div className="text-xs text-[#7A7A7A] uppercase tracking-widest font-bold">
                  Fragmento de Relatório • Estágio Letras 2026
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
