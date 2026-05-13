import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { InternshipEntry } from '../types';

const formatEntryDate = (dateValue: string): string => {
  // Preserve the exact calendar date stored in the record (YYYY-MM-DD).
  const [year, month, day] = dateValue.split('-');

  if (year && month && day) {
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  // Fallback for unexpected formats.
  return dateValue;
};

export const exportToDocx = async (entries: InternshipEntry[]) => {
  // Sort entries chronologically (oldest first)
  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  const sections = sortedEntries.map((entry) => {
    return [
      new Paragraph({
        text: `Data: ${formatEntryDate(entry.date)}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Horário: ${entry.startTime} - ${entry.endTime}`,
            bold: true,
          }),
        ],
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: entry.reportText || 'Sem relatório transcrito.',
        spacing: { after: 400 },
        alignment: AlignmentType.JUSTIFIED,
      }),
      new Paragraph({
        text: '________________________________________________________________________________',
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    ];
  }).flat();

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'Cronos Estágio - Relatório Consolidado',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),
          ...sections,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Relatorio_Estagio_${new Date().toISOString().split('T')[0]}.docx`);
};
