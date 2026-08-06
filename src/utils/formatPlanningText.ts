// Reformata um texto de planejamento colado em markdown, seguindo o mesmo estilo
// usado no plano de 18/08 (src/data/classPlanning.ts): cabeçalho em **Chave:** valor,
// seções numeradas como "## N. Título" e etapas como "### Etapa N — Título".
function formatBlock(block: string): string {
  const lines = block.split('\n');

  if (lines.length === 1) {
    const line = lines[0].trim();

    const etapaMatch = line.match(/^Etapa\s+\d+.*$/i);
    if (etapaMatch) return `### ${line}`;

    const numberedHeading = line.match(/^(\d+)[.)]\s+(.{2,80})$/);
    if (numberedHeading && line.split(' ').length <= 12) {
      return `## ${numberedHeading[1]}. ${numberedHeading[2]}`;
    }

    const keyValue = line.match(/^([A-ZÀ-Ú][\wà-úÀ-Ú ]{1,30}):\s*(.+)$/);
    if (keyValue) {
      return `**${keyValue[1]}:** ${keyValue[2]}`;
    }
  }

  return block;
}

export function formatPlanningText(raw: string, title: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const alreadyMarkdown = /^#{1,6}\s|\*\*[^*]+\*\*|^-\s|^\d+\.\s/m.test(trimmed);

  const blocks = trimmed.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  const formatted = blocks.map(alreadyMarkdown ? (b: string) => b : formatBlock).join('\n\n');

  const hasTemaLine = /^\*\*Tema:\*\*/im.test(formatted) || /^Tema:/im.test(trimmed);
  if (!hasTemaLine && title.trim()) {
    return `**Tema:** ${title.trim()}\n\n${formatted}`;
  }

  return formatted;
}
