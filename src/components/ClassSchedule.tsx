import React, { useState } from 'react';
import { Calendar as CalendarIcon, Loader2, FileText } from 'lucide-react';

interface ClassScheduleProps {
  onGenerateDoc: (rows: { date: string; content: string }[]) => void;
  isGeneratingDoc: boolean;
}

type Subject = 'geral' | 'interpretacao' | 'redacao';

interface InterpretacaoSession {
  date: string; // DD/MM
  day: string;
  content: string;
  foco: string;
  noClass?: boolean;
}

interface RedacaoSession {
  date: string;
  day: string;
  content: string;
  conexao: string;
  foco: string;
  noClass?: boolean;
}

interface Week<T> {
  title: string;
  sessions: T[];
}

const WEEKS_INTERPRETACAO: Week<InterpretacaoSession>[] = [
  {
    title: 'Semana 1',
    sessions: [
      { date: '18/08', day: 'Terça', content: 'Leitura x interpretação: decodificar, compreender e inferir', foco: 'Inferência básica, leitura literal x inferencial' },
      { date: '19/08', day: 'Quarta', content: 'Gêneros textuais I — textos do cotidiano (notícia, anúncio, receita, bula)', foco: 'Reconhecimento de gênero e finalidade comunicativa' },
      { date: '21/08', day: 'Sexta', content: 'Gêneros textuais II — narrar, descrever, dissertar', foco: 'Estrutura e propósito de tipos textuais' },
    ],
  },
  {
    title: 'Semana 2',
    sessions: [
      { date: '25/08', day: 'Terça', content: 'Suporte e esfera de circulação do texto', foco: 'Como o veículo (jornal, rede social, livro) afeta o sentido' },
      { date: '26/08', day: 'Quarta', content: 'Tema, ideia central e ideias secundárias', foco: 'Identificação da ideia principal — item clássico de prova' },
      { date: '28/08', day: 'Sexta', content: 'Estrutura do parágrafo e tópico frasal', foco: 'Localização da tese/ideia-núcleo do parágrafo' },
    ],
  },
  {
    title: 'Semana 3',
    sessions: [
      { date: '01/09', day: 'Terça', content: 'Coesão textual I — referenciação (pronomes, elipse)', foco: 'Retomada de termos, coesão referencial' },
      { date: '02/09', day: 'Quarta', content: 'Coesão textual II — conectivos (causa, consequência, oposição, adição)', foco: 'Relações lógico-discursivas entre orações' },
      { date: '04/09', day: 'Sexta', content: 'Coerência textual — relação entre as partes do texto', foco: 'Continuidade de sentido, não contradição' },
    ],
  },
  {
    title: 'Semana 4',
    sessions: [
      { date: '08/09', day: 'Terça', content: 'Progressão temática e paráfrase', foco: 'Reconhecer reescrita mantendo o sentido' },
      { date: '09/09', day: 'Quarta', content: 'Prática dirigida — questões de coesão e coerência (banco Enceja/Enem)', foco: 'Simulado temático' },
      { date: '11/09', day: 'Sexta', content: 'Semântica lexical I — denotação e conotação', foco: 'Sentido literal x figurado' },
    ],
  },
  {
    title: 'Semana 5',
    sessions: [
      { date: '15/09', day: 'Terça', content: 'Semântica lexical II — polissemia e ambiguidade lexical', foco: 'Palavras com múltiplos sentidos no contexto' },
      { date: '16/09', day: 'Quarta', content: 'Sinonímia, antonímia e campo semântico', foco: 'Substituição de termos sem perda de sentido' },
      { date: '18/09', day: 'Sexta', content: 'Figuras de linguagem I — metáfora e metonímia', foco: 'Leitura de sentido figurado em textos literários e publicitários' },
    ],
  },
  {
    title: 'Semana 6',
    sessions: [
      { date: '22/09', day: 'Terça', content: 'Figuras de linguagem II — ironia, hipérbole, eufemismo', foco: 'Efeitos de sentido e intenção do autor' },
      { date: '23/09', day: 'Quarta', content: 'Prática — figuras de linguagem em anúncios, poemas e tirinhas', foco: 'Simulado temático' },
      { date: '25/09', day: 'Sexta', content: 'Funções da linguagem I — referencial, emotiva, conativa', foco: 'Identificar finalidade/intenção do texto' },
    ],
  },
  {
    title: 'Semana 7',
    sessions: [
      { date: '29/09', day: 'Terça', content: 'Funções da linguagem II — fática, metalinguística, poética', foco: 'Reconhecer função predominante' },
      { date: '30/09', day: 'Quarta', content: 'Prática — funções da linguagem em anúncios e tirinhas', foco: 'Simulado temático' },
      { date: '02/10', day: 'Sexta', content: 'Intertextualidade I — conceito, paródia e paráfrase', foco: 'Diálogo entre textos' },
    ],
  },
  {
    title: 'Semana 8',
    sessions: [
      { date: '06/10', day: 'Terça', content: 'Intertextualidade II — citação, alusão, epígrafe', foco: 'Reconhecimento de referências implícitas' },
      { date: '07/10', day: 'Quarta', content: 'Prática — charges e memes que dialogam com outros textos', foco: 'Leitura crítica de intertextualidade' },
      { date: '09/10', day: 'Sexta', content: 'Variação linguística I — regional, social, histórica, situacional', foco: 'Reconhecer variedades da língua' },
    ],
  },
  {
    title: 'Semana 9',
    sessions: [
      { date: '13/10', day: 'Terça', content: 'Variação linguística II — norma padrão x preconceito linguístico', foco: 'Tema recorrente em textos de opinião do Enem' },
      { date: '14/10', day: 'Quarta', content: 'Pressupostos e subentendidos', foco: 'O que o texto afirma x o que sugere' },
      { date: '16/10', day: 'Sexta', content: '(sem aula)', foco: '—', noClass: true },
    ],
  },
  {
    title: 'Semana 10',
    sessions: [
      { date: '20/10', day: 'Terça', content: 'Ambiguidade proposital x involuntária; humor e duplo sentido', foco: 'Leitura de piadas, tirinhas e trocadilhos' },
      { date: '21/10', day: 'Quarta', content: 'Prática — interpretação de humor e duplo sentido', foco: 'Simulado temático' },
      { date: '23/10', day: 'Sexta', content: 'Argumentação I — tipos de argumento e estratégias persuasivas', foco: 'Base para a redação e para textos de opinião' },
    ],
  },
  {
    title: 'Semana 11',
    sessions: [
      { date: '27/10', day: 'Terça', content: 'Argumentação II — identificar tese e argumentos em texto dissertativo', foco: 'Leitura de artigos de opinião/editoriais' },
      { date: '28/10', day: 'Quarta', content: '(sem aula — feriado)', foco: '—', noClass: true },
      { date: '30/10', day: 'Sexta', content: 'Texto verbal e não verbal — leitura de imagens', foco: 'Interpretação de linguagem não verbal, frequente no Enem' },
    ],
  },
  {
    title: 'Semana 12',
    sessions: [
      { date: '03/11', day: 'Terça', content: 'Leitura de gráficos, tabelas e infográficos', foco: 'Interpretação de dados estatísticos, comum em questões de Enceja/Enem' },
      { date: '04/11', day: 'Quarta', content: 'Multimodalidade — textos que unem verbal e visual (memes, propagandas, charges)', foco: 'Leitura integrada de múltiplas linguagens' },
      { date: '06/11', day: 'Sexta', content: 'Simulado geral — bloco de questões estilo Enceja/Enem', foco: 'Avaliação formativa' },
    ],
  },
  {
    title: 'Semana 13',
    sessions: [
      { date: '10/11', day: 'Terça', content: 'Correção comentada do simulado', foco: 'Retomada dos pontos de maior erro da turma' },
      { date: '11/11', day: 'Quarta', content: 'Revisão geral e encerramento — tira-dúvidas finais', foco: 'Fechamento do conteúdo' },
    ],
  },
];

const OBSERVACOES_INTERPRETACAO = [
  'Os dias marcados com "?" no calendário original (16/10 e 28/10) foram tratados como sem aula — 28/10 também é feriado (Dia do Servidor Público).',
  'Como o primeiro dia deixou de ser diagnóstico, um novo conteúdo (leitura de gráficos e tabelas) foi incluído no bloco de multimodalidade para preencher o 36º encontro.',
  'A sequência pode ser ajustada conforme o ritmo da turma — os blocos de "prática/simulado" são bons pontos de flexibilidade caso precise reforçar algum tema.',
  'Sugestão de fontes de texto motivador: notícias atuais, tirinhas (Mafalda, Armandinho), letras de música, propagandas antigas e recentes, e provas anteriores do Enceja/Enem para ambientar a turma ao formato de prova.',
];

const WEEKS_REDACAO: Week<RedacaoSession>[] = [
  {
    title: 'Semana 1',
    sessions: [
      { date: '18/08', day: 'Terça', content: 'O que é o texto dissertativo-argumentativo? As 5 competências do Enem', conexao: '—', foco: 'Panorama da avaliação da redação' },
      { date: '19/08', day: 'Quarta', content: 'Diferenciando dissertar de narrar e descrever na escrita', conexao: 'Gêneros textuais I', foco: 'Reconhecer o gênero exigido pela prova' },
      { date: '21/08', day: 'Sexta', content: 'Estrutura do texto: introdução, desenvolvimento e conclusão', conexao: 'Gêneros textuais II', foco: 'Estrutura-base cobrada no Enem/Enceja' },
    ],
  },
  {
    title: 'Semana 2',
    sessions: [
      { date: '25/08', day: 'Terça', content: 'Como construir a tese (ideia central) a partir do tema proposto', conexao: 'Suporte e esfera de circulação', foco: 'Delimitação do tema — erro comum é fugir do tema' },
      { date: '26/08', day: 'Quarta', content: 'Planejamento textual: rascunho e esqueleto argumentativo', conexao: 'Tema, ideia central e secundárias', foco: 'Organização antes da escrita (Competência 3)' },
      { date: '28/08', day: 'Sexta', content: 'O parágrafo dissertativo: tópico frasal e unidade temática', conexao: 'Estrutura do parágrafo e tópico frasal', foco: 'Competência 3 — projeto de texto' },
    ],
  },
  {
    title: 'Semana 3',
    sessions: [
      { date: '01/09', day: 'Terça', content: 'Coesão na escrita I — referenciação e retomada de termos', conexao: 'Coesão textual I', foco: 'Competência 4' },
      { date: '02/09', day: 'Quarta', content: 'Coesão na escrita II — conectivos e operadores argumentativos', conexao: 'Coesão textual II', foco: 'Competência 4' },
      { date: '04/09', day: 'Sexta', content: 'Coerência na produção textual — evitando contradições e saltos lógicos', conexao: 'Coerência textual', foco: 'Competência 4' },
    ],
  },
  {
    title: 'Semana 4',
    sessions: [
      { date: '08/09', day: 'Terça', content: 'Progressão de ideias sem repetição — uso da paráfrase na escrita', conexao: 'Progressão temática e paráfrase', foco: 'Evitar redundância no texto' },
      { date: '09/09', day: 'Quarta', content: 'Prática — produção do parágrafo de introdução', conexao: 'Prática coesão/coerência', foco: 'Aplicação prática' },
      { date: '11/09', day: 'Sexta', content: 'Precisão vocabular — denotação, conotação e escolha lexical', conexao: 'Semântica lexical I', foco: 'Competência 1 (domínio da norma culta)' },
    ],
  },
  {
    title: 'Semana 5',
    sessions: [
      { date: '15/09', day: 'Terça', content: 'Evitando ambiguidade na escrita', conexao: 'Semântica lexical II', foco: 'Clareza como critério de correção' },
      { date: '16/09', day: 'Quarta', content: 'Variedade lexical — sinônimos e evitando repetição de palavras', conexao: 'Sinonímia, antonímia e campo semântico', foco: 'Riqueza vocabular (Competência 1)' },
      { date: '18/09', day: 'Sexta', content: 'Uso comedido de linguagem figurada na argumentação', conexao: 'Figuras de linguagem I', foco: 'Evitar excesso de subjetividade no texto argumentativo' },
    ],
  },
  {
    title: 'Semana 6',
    sessions: [
      { date: '22/09', day: 'Terça', content: 'Tipos de argumento I — autoridade e exemplificação', conexao: 'Figuras de linguagem II', foco: 'Competência 3 — estratégias argumentativas' },
      { date: '23/09', day: 'Quarta', content: 'Prática — parágrafo de desenvolvimento com argumento de exemplificação', conexao: 'Prática figuras de linguagem', foco: 'Aplicação prática' },
      { date: '25/09', day: 'Sexta', content: 'Adequação da linguagem à norma padrão (registro formal)', conexao: 'Funções da linguagem I', foco: 'Competência 1' },
    ],
  },
  {
    title: 'Semana 7',
    sessions: [
      { date: '29/09', day: 'Terça', content: 'Tipos de argumento II — causa/consequência e comparação', conexao: 'Funções da linguagem II', foco: 'Competência 3' },
      { date: '30/09', day: 'Quarta', content: 'Prática — parágrafo de desenvolvimento com causa/consequência', conexao: 'Prática funções da linguagem', foco: 'Aplicação prática' },
      { date: '02/10', day: 'Sexta', content: 'Repertório sociocultural I — o que é e por que "decorar frases prontas" não funciona', conexao: 'Intertextualidade I', foco: 'Competência 2' },
    ],
  },
  {
    title: 'Semana 8',
    sessions: [
      { date: '06/10', day: 'Terça', content: 'Repertório sociocultural II — como inserir citação/dado sem parecer forçado', conexao: 'Intertextualidade II', foco: 'Competência 2' },
      { date: '07/10', day: 'Quarta', content: 'Prática — parágrafo usando repertório legitimado', conexao: 'Prática intertextualidade', foco: 'Aplicação prática' },
      { date: '09/10', day: 'Sexta', content: 'Adequação à norma culta — evitando marcas de oralidade na escrita formal', conexao: 'Variação linguística I', foco: 'Competência 1' },
    ],
  },
  {
    title: 'Semana 9',
    sessions: [
      { date: '13/10', day: 'Terça', content: 'Coesão entre parágrafos — transições e conectivos interparagrafais', conexao: 'Variação linguística II', foco: 'Competência 4' },
      { date: '14/10', day: 'Quarta', content: 'Clareza e objetividade — cortando pressupostos e informações implícitas desnecessárias', conexao: 'Pressupostos e subentendidos', foco: 'Competência 3' },
      { date: '16/10', day: 'Sexta', content: '(sem aula)', conexao: '—', foco: '—', noClass: true },
    ],
  },
  {
    title: 'Semana 10',
    sessions: [
      { date: '20/10', day: 'Terça', content: 'Revisão de texto — identificando e corrigindo ambiguidade e imprecisão', conexao: 'Ambiguidade proposital/humor', foco: 'Estratégias de autorrevisão' },
      { date: '21/10', day: 'Quarta', content: 'Prática — reescrita e autocorreção de um parágrafo próprio', conexao: 'Prática humor e duplo sentido', foco: 'Aplicação prática' },
      { date: '23/10', day: 'Sexta', content: 'Contra-argumentação — antecipando e refutando o senso comum', conexao: 'Argumentação I', foco: 'Competência 3 — texto mais robusto' },
    ],
  },
  {
    title: 'Semana 11',
    sessions: [
      { date: '27/10', day: 'Terça', content: 'Proposta de intervenção I — agente, ação, modo/meio, efeito, detalhamento', conexao: 'Argumentação II', foco: 'Competência 5' },
      { date: '28/10', day: 'Quarta', content: '(sem aula — feriado)', conexao: '—', foco: '—', noClass: true },
      { date: '30/10', day: 'Sexta', content: 'Proposta de intervenção II — erros comuns (vaga, agressiva ou fora do tema)', conexao: 'Texto verbal e não verbal', foco: 'Competência 5' },
    ],
  },
  {
    title: 'Semana 12',
    sessions: [
      { date: '03/11', day: 'Terça', content: 'Usando dados, gráficos e tabelas como repertório argumentativo', conexao: 'Leitura de gráficos, tabelas e infográficos', foco: 'Competência 2' },
      { date: '04/11', day: 'Quarta', content: 'Produção de texto completo I — dissertação com tema inédito (tempo cronometrado)', conexao: 'Multimodalidade', foco: 'Simulação de prova' },
      { date: '06/11', day: 'Sexta', content: 'Simulado geral — redação nos moldes do Enem/Enceja', conexao: 'Simulado geral', foco: 'Avaliação formativa' },
    ],
  },
  {
    title: 'Semana 13',
    sessions: [
      { date: '10/11', day: 'Terça', content: 'Correção comentada das redações — pontos fortes e erros recorrentes', conexao: 'Correção comentada do simulado', foco: 'Retomada dos pontos de maior erro da turma' },
      { date: '11/11', day: 'Quarta', content: 'Revisão geral e reescrita final — fechamento do conteúdo', conexao: 'Revisão geral e encerramento', foco: 'Fechamento do conteúdo' },
    ],
  },
];

const OBSERVACOES_GERAL = [
  '📖 = Interpretação de Texto | ✍️ = Redação — os dois blocos acontecem no mesmo dia, um em seguida do outro.',
  '16/10 e 28/10 seguem sem aula nas duas disciplinas.',
  'As linhas foram casadas para que o conteúdo de interpretação sirva de gancho para o de redação no mesmo dia (ex.: 11/09 — denotação/conotação na leitura é reaproveitada na escolha de palavras da escrita).',
];

const OBSERVACOES_REDACAO = [
  'Os dias marcados com "?" no calendário (16/10 e 28/10) foram tratados como sem aula, iguais aos de interpretação de texto.',
  'A coluna "Conexão com interpretação" mostra o assunto visto na aula de interpretação do mesmo dia — útil para fazer a ponte entre as duas disciplinas na aula casada (ex.: em 11/09, "denotação e conotação" é visto na leitura e reaproveitado imediatamente na escolha de palavras da redação).',
  'As competências 1 a 5 citadas são as da matriz de correção da redação do Enem (domínio da norma culta; compreensão do tema; organização de argumentos; mecanismos linguísticos/coesão; proposta de intervenção) — o Enceja avalia critérios semelhantes de forma mais simplificada.',
  'Assim como no cronograma de interpretação, os blocos de "prática" são pontos de flexibilidade para reforço, caso a turma precise de mais tempo em algum tópico.',
];

interface GeralSession {
  date: string;
  day: string;
  interpretacao: string;
  redacao: string;
  noClass?: boolean;
}

const WEEKS_GERAL: Week<GeralSession>[] = WEEKS_INTERPRETACAO.map((week, wi) => ({
  title: week.title,
  sessions: week.sessions.map((s, si) => {
    const r = WEEKS_REDACAO[wi].sessions[si];
    return {
      date: s.date,
      day: s.day,
      interpretacao: s.content,
      redacao: r.content,
      noClass: s.noClass,
    };
  }),
}));

const SUBJECT_OPTIONS: { id: Subject; label: string }[] = [
  { id: 'geral', label: 'Geral' },
  { id: 'interpretacao', label: 'Interpretação de Texto' },
  { id: 'redacao', label: 'Redação' },
];

export const ClassSchedule: React.FC<ClassScheduleProps> = ({ onGenerateDoc, isGeneratingDoc }) => {
  const [subject, setSubject] = useState<Subject>('geral');

  const handleGenerate = () => {
    let rows: { date: string; content: string }[] = [];

    if (subject === 'interpretacao') {
      rows = WEEKS_INTERPRETACAO.flatMap(week =>
        week.sessions.map(s => ({
          date: s.date,
          content: s.noClass ? s.content : `${s.content} — Foco Enceja/Enem: ${s.foco}`,
        }))
      );
    } else if (subject === 'redacao') {
      rows = WEEKS_REDACAO.flatMap(week =>
        week.sessions.map(s => ({
          date: s.date,
          content: s.noClass ? s.content : `${s.content} — Foco Enceja/Enem: ${s.foco}`,
        }))
      );
    } else {
      rows = WEEKS_GERAL.flatMap(week =>
        week.sessions.map(s => ({
          date: s.date,
          content: s.noClass ? s.interpretacao : `Interpretação de Texto: ${s.interpretacao} | Redação: ${s.redacao}`,
        }))
      );
    }

    onGenerateDoc(rows);
  };

  const title =
    subject === 'interpretacao'
      ? 'Cronograma de Aulas — Interpretação de Texto (Semântica)'
      : subject === 'redacao'
      ? 'Cronograma de Aulas — Redação (Texto Dissertativo-Argumentativo)'
      : 'Cronograma Casado — Interpretação de Texto + Redação';

  const description =
    subject === 'interpretacao' ? (
      <>
        Progressão pensada em blocos temáticos crescentes: parte da leitura básica, passa por coesão/coerência,
        semântica lexical, figuras de linguagem, funções da linguagem, intertextualidade, variação linguística,
        pressupostos/ambiguidade, argumentação e multimodalidade — fechando com simulado e revisão. Os conteúdos
        foram escolhidos por serem recorrentes tanto na matriz de Língua Portuguesa do Enceja quanto na área de
        Linguagens, Códigos e suas Tecnologias do Enem. Todos os 36 encontros já entram com conteúdo de
        interpretação de texto — sem aula introdutória/diagnóstica.
      </>
    ) : subject === 'redacao' ? (
      <>
        Cronograma pensado para casar com o de interpretação de texto, ministrado no mesmo dia logo em seguida. A
        lógica: fundamentos do texto dissertativo-argumentativo → parágrafo, coesão e coerência na escrita →
        precisão vocabular → tipos de argumento → repertório sociocultural → norma culta → revisão e
        contra-argumentação → proposta de intervenção → uso de dados como repertório → produção de textos completos
        e simulados. Sempre que fizer sentido, o conteúdo do dia dialoga com o que foi visto em interpretação de
        texto na mesma aula — a coluna "Conexão" mostra esse elo.
      </>
    ) : (
      <>
        <strong className="text-slate-700">Formato da aula casada:</strong> primeiro bloco de{' '}
        <strong className="text-slate-700">Interpretação de Texto</strong>, em seguida{' '}
        <strong className="text-slate-700">Redação</strong>, sempre dialogando com o que acabou de ser visto.
      </>
    );

  const observacoes =
    subject === 'redacao' ? OBSERVACOES_REDACAO : subject === 'geral' ? OBSERVACOES_GERAL : OBSERVACOES_INTERPRETACAO;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="bg-[#00B37E] p-3 rounded-2xl text-white shadow-md shadow-[#00B37E]/20 self-start">
          <CalendarIcon size={28} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 text-sm mt-1">
            <strong className="text-slate-700">Turma:</strong> CEJA &nbsp;|&nbsp;
            <strong className="text-slate-700"> Período:</strong> 18/08 a 11/11 &nbsp;|&nbsp;
            <strong className="text-slate-700"> Dias:</strong> Terça, Quarta e Sexta
          </p>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">{description}</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGeneratingDoc}
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shrink-0"
          title="Gerar tabela do cronograma no Google Docs"
        >
          {isGeneratingDoc ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <FileText size={18} />
          )}
          {isGeneratingDoc ? 'Gerando...' : 'Gerar no Google Docs'}
        </button>
      </header>

      <div className="flex gap-2 mb-6">
        {SUBJECT_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setSubject(opt.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors border ${
              subject === opt.id
                ? 'bg-[#0F172A] text-white border-transparent'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {subject === 'interpretacao' &&
          WEEKS_INTERPRETACAO.map(week => (
            <div key={week.title} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">{week.title}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                      <th className="py-2 px-3 whitespace-nowrap">Data</th>
                      <th className="py-2 px-3 whitespace-nowrap">Dia</th>
                      <th className="py-2 px-3">Conteúdo</th>
                      <th className="py-2 px-3">Foco Enceja/Enem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {week.sessions.map(session => (
                      <tr
                        key={session.date}
                        className={`border-b border-slate-100 last:border-0 ${session.noClass ? 'bg-amber-50/60 text-amber-800' : 'text-slate-700'}`}
                      >
                        <td className="py-3 px-3 font-bold whitespace-nowrap">{session.date}</td>
                        <td className="py-3 px-3 whitespace-nowrap">{session.day}</td>
                        <td className="py-3 px-3">{session.content}</td>
                        <td className="py-3 px-3 text-slate-500">{session.foco}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

        {subject === 'redacao' &&
          WEEKS_REDACAO.map(week => (
            <div key={week.title} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">{week.title}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                      <th className="py-2 px-3 whitespace-nowrap">Data</th>
                      <th className="py-2 px-3 whitespace-nowrap">Dia</th>
                      <th className="py-2 px-3">Conteúdo</th>
                      <th className="py-2 px-3">Conexão com interpretação</th>
                      <th className="py-2 px-3">Foco Enceja/Enem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {week.sessions.map(session => (
                      <tr
                        key={session.date}
                        className={`border-b border-slate-100 last:border-0 ${session.noClass ? 'bg-amber-50/60 text-amber-800' : 'text-slate-700'}`}
                      >
                        <td className="py-3 px-3 font-bold whitespace-nowrap">{session.date}</td>
                        <td className="py-3 px-3 whitespace-nowrap">{session.day}</td>
                        <td className="py-3 px-3">{session.content}</td>
                        <td className="py-3 px-3 text-slate-500">{session.conexao}</td>
                        <td className="py-3 px-3 text-slate-500">{session.foco}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

        {subject === 'geral' &&
          WEEKS_GERAL.map(week => (
            <div key={week.title} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">{week.title}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                      <th className="py-2 px-3 whitespace-nowrap">Data</th>
                      <th className="py-2 px-3 whitespace-nowrap">Dia</th>
                      <th className="py-2 px-3">📖 Interpretação de Texto</th>
                      <th className="py-2 px-3">✍️ Redação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {week.sessions.map(session => (
                      <tr
                        key={session.date}
                        className={`border-b border-slate-100 last:border-0 ${session.noClass ? 'bg-amber-50/60 text-amber-800' : 'text-slate-700'}`}
                      >
                        <td className="py-3 px-3 font-bold whitespace-nowrap">{session.date}</td>
                        <td className="py-3 px-3 whitespace-nowrap">{session.day}</td>
                        <td className="py-3 px-3">{session.interpretacao}</td>
                        <td className="py-3 px-3">{session.redacao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-8">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Observações</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 leading-relaxed">
          {observacoes.map((obs, idx) => (
            <li key={idx}>{obs}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
