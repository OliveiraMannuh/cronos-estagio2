import React from 'react';
import { motion } from 'motion/react';

interface GalleryItem {
  id: number;
  url: string;
  phrase: string;
  category: string;
}

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    url: 'https://i.postimg.cc/SsLTKDX2/9f2eded6-18ba-4e99-ba9a-c36f2a19a02d.jpg',
    phrase: "A linguagem é a única pátria onde o saber se manifesta plenamente.",
    category: "Linguística"
  },
  {
    id: 2,
    url: 'https://i.postimg.cc/DyNgntCN/bf021cac-df5e-4cf4-8975-d1098fc55c97.jpg',
    phrase: "Cada registro é um fragmento essencial da nossa jornada pedagógica.",
    category: "Prática"
  },
  {
    id: 3,
    url: 'https://i.postimg.cc/7L9JYzxN/04db2f71-80b7-4e1c-9f52-9e8038e2c0a5.jpg',
    phrase: "Arquivar o presente é garantir o futuro da memória institucional.",
    category: "Gestão"
  },
  {
    id: 4,
    url: 'https://i.postimg.cc/QM3cLc59/Whats-App-Image-2026-05-13-at-18-57-54.jpg',
    phrase: "Entre livros e relatórios, a prática docente ganha forma e propósito.",
    category: "Ensino"
  }
];

export const InteractiveGallery: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {galleryItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          viewport={{ once: true }}
          className="group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer"
        >
          <img
            src={item.url}
            alt={item.category}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4 sm:p-8">
            <span className="text-white/60 text-[10px] uppercase tracking-[0.2em] mb-2 font-medium">
              {item.category}
            </span>
            <p className="text-white text-lg font-serif italic leading-snug">
              "{item.phrase}"
            </p>
          </div>
          {/* Static info visible on mobile - always show gradient + text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden flex flex-col justify-end p-4">
            <span className="text-white/70 text-[9px] uppercase tracking-widest font-bold mb-1">{item.category}</span>
            <p className="text-white text-xs font-serif italic leading-snug">"{item.phrase}"</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
