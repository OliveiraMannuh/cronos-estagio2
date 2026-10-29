import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarCheck,
  CalendarPlus,
  CalendarX,
  Loader2,
  FileText,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Pencil,
  Check,
  X,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { scheduleDateSortKey } from '../data/scheduleDates';

interface ClassScheduleProps {
  userId: string;
  onGenerateDoc: (payload: { title: string; headers: string[]; rows: string[][] }) => void;
  isGeneratingDoc: boolean;
}

type Subject = 'geral' | 'interpretacao' | 'redacao';

interface InterpretacaoSession {
  date: string; // DD/MM
  day: string;
  content: string;
  foco: string;
  noClass?: boolean;
  extra?: boolean; // dia extra fora da grade regular (ex.: planejamento)
}

interface RedacaoSession {
  date: string;
  day: string;
  content: string;
  conexao: string;
  foco: string;
  noClass?: boolean;
  extra?: boolean; // dia extra fora da grade regular (ex.: planejamento)
}

interface Week<T> {
  title: string;
  sessions: T[];
}

const WEEKS_INTERPRETACAO: Week<InterpretacaoSession>[] = [
  {
    title: 'Semana 1',
    sessions: [
      { date: '21/08', day: 'Sexta', content: 'Leitura x interpretação: decodificar, compreender e inferir', foco: 'Inferência básica, leitura literal x inferencial' },
      { date: '25/08', day: 'Terça', content: 'Revisão — Leitura x interpretação: decodificar, compreender e inferir', foco: 'Retomada do conteúdo da aula anterior, em função da apresentação do projeto "O dia da beleza e identidade"' },
    ],
  },
  {
    title: 'Semana 2',
    sessions: [
      { date: '26/08', day: 'Quarta', content: 'Gêneros textuais I — textos do cotidiano (notícia, anúncio, receita, bula)', foco: 'Reconhecimento de gênero e finalidade comunicativa' },
      { date: '28/08', day: 'Sexta', content: 'Gêneros textuais II — narrar, descrever, dissertar', foco: 'Estrutura e propósito de tipos textuais' },
      { date: '01/09', day: 'Terça', content: 'Fato x Opinião', foco: 'F7 – Analisar criticamente os diferentes discursos, inclusive o próprio, desenvolvendo a capacidade de avaliação de textos' },
    ],
  },
  {
    title: 'Semana 3',
    sessions: [
      { date: '02/09', day: 'Quarta', content: 'Tema, ideia central e ideias secundárias', foco: 'Identificação da ideia principal — item clássico de prova' },
      { date: '04/09', day: 'Sexta', content: '(sem aula — formação Selo Escola Antirracista)', foco: '—', noClass: true },
      { date: '08/09', day: 'Terça', content: '(sem aula — aniversário do Domingues)', foco: '—', noClass: true },
    ],
  },
  {
    title: 'Semana 4',
    sessions: [
      { date: '09/09', day: 'Quarta', content: 'Estrutura do parágrafo e tópico frasal', foco: 'Localização da tese/ideia-núcleo do parágrafo' },
      { date: '11/09', day: 'Sexta', content: '(sem aula — problemas técnicos: sala sem ar-condicionado e Domingues doente)', foco: '—', noClass: true },
      { date: '15/09', day: 'Terça', content: 'Coesão textual I — referenciação (pronomes, elipse)', foco: 'Retomada de termos, coesão referencial' },
    ],
  },
  {
    title: 'Semana 5',
    sessions: [
      { date: '16/09', day: 'Quarta', content: 'Coesão textual II — conectivos (causa, consequência, oposição, adição)', foco: 'Relações lógico-discursivas entre orações' },
      { date: '18/09', day: 'Sexta', content: 'Coerência textual — relação entre as partes do texto', foco: 'Continuidade de sentido, não contradição' },
      { date: '21/09', day: 'Segunda', content: 'Dia extra — planejamento das aulas de redação e interpretação de texto', foco: '—', extra: true },
      { date: '22/09', day: 'Terça', content: 'Revisão — coerência textual', foco: 'Retomada de continuidade de sentido e não contradição' },
    ],
  },
  {
    title: 'Semana 6',
    sessions: [
      { date: '23/09', day: 'Quarta', content: 'Participação no projeto "Leitura é vida"', foco: '—' },
      { date: '25/09', day: 'Sexta', content: 'Progressão temática e paráfrase', foco: 'Reconhecer reescrita mantendo o sentido' },
      { date: '29/09', day: 'Terça', content: 'Participação no projeto "Memórias da resistência"', foco: '—' },
    ],
  },
  {
    title: 'Semana 7',
    sessions: [
      { date: '30/09', day: 'Quarta', content: 'Progressão temática e paráfrase (continuação)', foco: 'Simulado temático' },
      { date: '02/10', day: 'Sexta', content: 'Progressão temática e paráfrase (continuação)', foco: 'Simulado temático' },
      { date: '06/10', day: 'Terça', content: 'Aula interdisciplinar com Filosofia', foco: '—' },
    ],
  },
  {
    title: 'Semana 8',
    sessions: [
      { date: '07/10', day: 'Quarta', content: 'Semântica lexical I — denotação e conotação', foco: 'Sentido literal x figurado' },
      { date: '09/10', day: 'Sexta', content: 'Semântica lexical II — polissemia e ambiguidade lexical', foco: 'Palavras com múltiplos sentidos no contexto' },
      { date: '13/10', day: 'Terça', content: '(sem aula)', foco: '—', noClass: true },
    ],
  },
  {
    title: 'Semana 9',
    sessions: [
      { date: '14/10', day: 'Quarta', content: 'Sinonímia, antonímia e campo semântico', foco: 'Substituição de termos sem perda de sentido' },
      { date: '16/10', day: 'Sexta', content: 'Figuras de linguagem I — metáfora e metonímia', foco: 'Leitura de sentido figurado em textos literários e publicitários' },
      { date: '20/10', day: 'Terça', content: 'Figuras de linguagem II — ironia, hipérbole, eufemismo', foco: 'Efeitos de sentido e intenção do autor' },
    ],
  },
  {
    title: 'Semana 10',
    sessions: [
      { date: '21/10', day: 'Quarta', content: 'Funções da linguagem I — referencial, emotiva, conativa', foco: 'Identificar finalidade/intenção do texto' },
      { date: '23/10', day: 'Sexta', content: 'Funções da linguagem II — fática, metalinguística, poética', foco: 'Reconhecer função predominante' },
      { date: '27/10', day: 'Terça', content: 'Intertextualidade I — conceito, paródia e paráfrase', foco: 'Diálogo entre textos' },
    ],
  },
  {
    title: 'Semana 11',
    sessions: [
      { date: '28/10', day: 'Quarta', content: 'Intertextualidade II — citação, alusão, epígrafe', foco: 'Reconhecimento de referências implícitas' },
      { date: '30/10', day: 'Sexta', content: '(sem aula — feriado)', foco: '—', noClass: true },
      { date: '03/11', day: 'Terça', content: 'Variação linguística I — regional, social, histórica, situacional', foco: 'Reconhecer variedades da língua' },
    ],
  },
  {
    title: 'Semana 12',
    sessions: [
      { date: '04/11', day: 'Quarta', content: 'Variação linguística II — norma padrão x preconceito linguístico', foco: 'Tema recorrente em textos de opinião do Enem' },
      { date: '06/11', day: 'Sexta', content: 'Pressupostos e subentendidos', foco: 'O que o texto afirma x o que sugere' },
      { date: '10/11', day: 'Terça', content: 'Ambiguidade proposital x involuntária; humor e duplo sentido', foco: 'Leitura de piadas, tirinhas e trocadilhos' },
    ],
  },
  {
    title: 'Semana 13',
    sessions: [
      { date: '11/11', day: 'Quarta', content: 'Argumentação I — tipos de argumento e estratégias persuasivas', foco: 'Base para a redação e para textos de opinião' },
      { date: '13/11', day: 'Sexta', content: 'Argumentação II — identificar tese e argumentos em texto dissertativo', foco: 'Leitura de artigos de opinião/editoriais' },
      { date: '17/11', day: 'Terça', content: 'Texto verbal e não verbal — leitura de imagens', foco: 'Interpretação de linguagem não verbal, frequente no Enem' },
    ],
  },
  {
    title: 'Semana 14',
    sessions: [
      { date: '18/11', day: 'Quarta', content: 'Leitura de gráficos, tabelas e infográficos + Multimodalidade — textos que unem verbal e visual (memes, propagandas, charges)', foco: 'Interpretação de dados estatísticos, comum em questões de Enceja/Enem / Leitura integrada de múltiplas linguagens' },
    ],
  },
];

const OBSERVACOES_INTERPRETACAO = [
  'Não haverá aula em 04/09 devido à formação para o Selo Escola Antirracista. O conteúdo dessa data foi remanejado (não removido), empurrando cada aula seguinte para o próximo dia de aula (ter/qua/sex) e acrescentando um novo encontro em 18/11 ao final do cronograma para acomodar o conteúdo que sobrou.',
  'Não houve aula em 08/09 devido ao aniversário do Domingues. O conteúdo dessa data foi remanejado, empurrando cada aula seguinte para o próximo dia de aula (mantendo fixos os dias sem aula e a aula interdisciplinar de 06/10); para acomodar a mudança, a revisão geral e encerramento (antes em 18/11) foi retirada.',
  'Não houve aula em 11/09 devido a problemas técnicos (sala sem ar-condicionado e Domingues doente). O conteúdo dessa data foi remanejado da mesma forma, empurrando cada aula seguinte para o próximo dia de aula; para acomodar a mudança, o simulado geral (antes em 18/11) foi retirado.',
  'Em 06/10 foi realizada uma aula interdisciplinar com Filosofia. O conteúdo previsto para essa data foi remanejado, empurrando cada aula seguinte para o próximo dia de aula; para acomodar a mudança, a correção comentada do simulado (antes em 17/11) foi retirada, e o simulado geral passou para 17/11.',
  'Em 22/09 foi feita uma revisão sobre coerência textual. O conteúdo previsto para essa data foi remanejado, empurrando cada aula seguinte para o próximo dia de aula; para acomodar a mudança, a prática de funções da linguagem em anúncios e tirinhas (antes em 20/10) foi retirada.',
  'Em 23/09 a turma participou do projeto "Leitura é vida". O conteúdo previsto para essa data foi remanejado, empurrando cada aula seguinte para o próximo dia de aula; para acomodar a mudança, a prática com charges e memes que dialogam com outros textos (antes em 27/10) foi retirada.',
  'Em 29/09 a turma participou do projeto "Memórias da resistência". O conteúdo previsto para essa data foi remanejado, empurrando cada aula seguinte para o próximo dia de aula; para acomodar a mudança, os conteúdos das duas últimas aulas (leitura de gráficos, tabelas e infográficos + multimodalidade) foram unidos em 18/11.',
  'Em 21/09 (segunda) houve um dia extra, fora da grade regular, dedicado ao planejamento das aulas de redação e interpretação de texto — destacado em azul claro. Nenhum conteúdo foi remanejado por causa dele.',
  'Não haverá aula em 13/10 (antes o dia sem aula previsto era 16/10). O conteúdo de 13/10 passou para 14/10 e o de 14/10 para 16/10; as demais aulas não mudaram.',
  'O feriado do Dia do Servidor Público foi transferido de 28/10 para 30/10: 28/10 passou a ter aula normal (com o conteúdo antes previsto para 30/10) e 30/10 ficou sem aula.',
  'Como o primeiro dia deixou de ser diagnóstico, um novo conteúdo (leitura de gráficos e tabelas) foi incluído no bloco de multimodalidade para preencher o 36º encontro.',
  'A sequência pode ser ajustada conforme o ritmo da turma — os blocos de "prática/simulado" são bons pontos de flexibilidade caso precise reforçar algum tema.',
  'Sugestão de fontes de texto motivador: notícias atuais, tirinhas (Mafalda, Armandinho), letras de música, propagandas antigas e recentes, e provas anteriores do Enceja/Enem para ambientar a turma ao formato de prova.',
];

const WEEKS_REDACAO: Week<RedacaoSession>[] = [
  {
    title: 'Semana 1',
    sessions: [
      { date: '21/08', day: 'Sexta', content: 'O que é o texto dissertativo-argumentativo? As 5 competências do Enem', conexao: '—', foco: 'Panorama da avaliação da redação' },
      { date: '25/08', day: 'Terça', content: 'Revisão do conteúdo da aula anterior do cronograma', conexao: '—', foco: 'Consolidação do conteúdo da aula anterior' },
    ],
  },
  {
    title: 'Semana 2',
    sessions: [
      { date: '26/08', day: 'Quarta', content: 'Diferenciando dissertar de narrar e descrever na escrita', conexao: 'Gêneros textuais I', foco: 'Reconhecer o gênero exigido pela prova' },
      { date: '28/08', day: 'Sexta', content: 'Estrutura do texto: introdução, desenvolvimento e conclusão', conexao: 'Gêneros textuais II', foco: 'Estrutura-base cobrada no Enem/Enceja' },
      { date: '01/09', day: 'Terça', content: 'Como construir a tese (ideia central) a partir do tema proposto', conexao: 'Suporte e esfera de circulação', foco: 'Delimitação do tema — erro comum é fugir do tema' },
    ],
  },
  {
    title: 'Semana 3',
    sessions: [
      { date: '02/09', day: 'Quarta', content: 'Planejamento textual: rascunho e esqueleto argumentativo', conexao: 'Tema, ideia central e secundárias', foco: 'Organização antes da escrita (Competência 3)' },
      { date: '04/09', day: 'Sexta', content: '(sem aula — formação Selo Escola Antirracista)', conexao: '—', foco: '—', noClass: true },
      { date: '08/09', day: 'Terça', content: '(sem aula — aniversário do Domingues)', conexao: '—', foco: '—', noClass: true },
    ],
  },
  {
    title: 'Semana 4',
    sessions: [
      { date: '09/09', day: 'Quarta', content: 'O parágrafo dissertativo: tópico frasal e unidade temática', conexao: 'Estrutura do parágrafo e tópico frasal', foco: 'Competência 3 — projeto de texto' },
      { date: '11/09', day: 'Sexta', content: '(sem aula — problemas técnicos: sala sem ar-condicionado e Domingues doente)', conexao: '—', foco: '—', noClass: true },
      { date: '15/09', day: 'Terça', content: 'Coesão na escrita I — referenciação e retomada de termos', conexao: 'Coesão textual I', foco: 'Competência 4' },
    ],
  },
  {
    title: 'Semana 5',
    sessions: [
      { date: '16/09', day: 'Quarta', content: 'Coesão na escrita II — conectivos e operadores argumentativos', conexao: 'Coesão textual II', foco: 'Competência 4' },
      { date: '18/09', day: 'Sexta', content: 'Coerência na produção textual — evitando contradições e saltos lógicos', conexao: 'Coerência textual', foco: 'Competência 4' },
      { date: '21/09', day: 'Segunda', content: 'Dia extra — planejamento das aulas de redação e interpretação de texto', conexao: '—', foco: '—', extra: true },
      { date: '22/09', day: 'Terça', content: 'Progressão de ideias sem repetição — uso da paráfrase na escrita', conexao: 'Progressão temática e paráfrase', foco: 'Evitar redundância no texto' },
    ],
  },
  {
    title: 'Semana 6',
    sessions: [
      { date: '23/09', day: 'Quarta', content: 'Participação no projeto "Leitura é vida"', conexao: '—', foco: '—' },
      { date: '25/09', day: 'Sexta', content: 'Prática — produção do parágrafo de introdução', conexao: 'Prática coesão/coerência', foco: 'Aplicação prática' },
      { date: '29/09', day: 'Terça', content: 'Participação no projeto "Memórias da resistência"', conexao: '—', foco: '—' },
    ],
  },
  {
    title: 'Semana 7',
    sessions: [
      { date: '30/09', day: 'Quarta', content: 'Precisão vocabular — denotação, conotação e escolha lexical', conexao: 'Semântica lexical I', foco: 'Competência 1 (domínio da norma culta)' },
      { date: '02/10', day: 'Sexta', content: 'Evitando ambiguidade na escrita', conexao: 'Semântica lexical II', foco: 'Clareza como critério de correção' },
      { date: '06/10', day: 'Terça', content: 'Variedade lexical — sinônimos e evitando repetição de palavras', conexao: 'Sinonímia, antonímia e campo semântico', foco: 'Riqueza vocabular (Competência 1)' },
    ],
  },
  {
    title: 'Semana 8',
    sessions: [
      { date: '07/10', day: 'Quarta', content: 'Uso comedido de linguagem figurada na argumentação', conexao: 'Figuras de linguagem I', foco: 'Evitar excesso de subjetividade no texto argumentativo' },
      { date: '09/10', day: 'Sexta', content: 'Tipos de argumento I — autoridade e exemplificação', conexao: 'Figuras de linguagem II', foco: 'Competência 3 — estratégias argumentativas' },
      { date: '13/10', day: 'Terça', content: '(sem aula)', conexao: '—', foco: '—', noClass: true },
    ],
  },
  {
    title: 'Semana 9',
    sessions: [
      { date: '14/10', day: 'Quarta', content: 'Prática — parágrafo de desenvolvimento com argumento de exemplificação', conexao: 'Prática figuras de linguagem', foco: 'Aplicação prática' },
      { date: '16/10', day: 'Sexta', content: 'Adequação da linguagem à norma padrão (registro formal)', conexao: 'Funções da linguagem I', foco: 'Competência 1' },
      { date: '20/10', day: 'Terça', content: 'Tipos de argumento II — causa/consequência e comparação', conexao: 'Funções da linguagem II', foco: 'Competência 3' },
    ],
  },
  {
    title: 'Semana 10',
    sessions: [
      { date: '21/10', day: 'Quarta', content: 'Prática — parágrafo de desenvolvimento com causa/consequência', conexao: 'Prática funções da linguagem', foco: 'Aplicação prática' },
      { date: '23/10', day: 'Sexta', content: 'Repertório sociocultural I — o que é e por que "decorar frases prontas" não funciona', conexao: 'Intertextualidade I', foco: 'Competência 2' },
      { date: '27/10', day: 'Terça', content: 'Repertório sociocultural II — como inserir citação/dado sem parecer forçado', conexao: 'Intertextualidade II', foco: 'Competência 2' },
    ],
  },
  {
    title: 'Semana 11',
    sessions: [
      { date: '28/10', day: 'Quarta', content: 'Adequação à norma culta — evitando marcas de oralidade na escrita formal', conexao: 'Variação linguística I', foco: 'Competência 1' },
      { date: '30/10', day: 'Sexta', content: '(sem aula — feriado)', conexao: '—', foco: '—', noClass: true },
      { date: '03/11', day: 'Terça', content: 'Coesão entre parágrafos — transições e conectivos interparagrafais', conexao: 'Variação linguística II', foco: 'Competência 4' },
    ],
  },
  {
    title: 'Semana 12',
    sessions: [
      { date: '04/11', day: 'Quarta', content: 'Clareza e objetividade — cortando pressupostos e informações implícitas desnecessárias', conexao: 'Pressupostos e subentendidos', foco: 'Competência 3' },
      { date: '06/11', day: 'Sexta', content: 'Revisão de texto — identificando e corrigindo ambiguidade e imprecisão', conexao: 'Ambiguidade proposital/humor', foco: 'Estratégias de autorrevisão' },
      { date: '10/11', day: 'Terça', content: 'Prática — reescrita e autocorreção de um parágrafo próprio', conexao: 'Prática humor e duplo sentido', foco: 'Aplicação prática' },
    ],
  },
  {
    title: 'Semana 13',
    sessions: [
      { date: '11/11', day: 'Quarta', content: 'Contra-argumentação — antecipando e refutando o senso comum', conexao: 'Argumentação I', foco: 'Competência 3 — texto mais robusto' },
      { date: '13/11', day: 'Sexta', content: 'Proposta de intervenção I — agente, ação, modo/meio, efeito, detalhamento', conexao: 'Argumentação II', foco: 'Competência 5' },
      { date: '17/11', day: 'Terça', content: 'Proposta de intervenção II — erros comuns (vaga, agressiva ou fora do tema)', conexao: 'Texto verbal e não verbal', foco: 'Competência 5' },
    ],
  },
  {
    title: 'Semana 14',
    sessions: [
      { date: '18/11', day: 'Quarta', content: 'Usando dados, gráficos e tabelas como repertório argumentativo + Produção de texto completo I — dissertação com tema inédito (tempo cronometrado)', conexao: 'Leitura de gráficos, tabelas e infográficos / Multimodalidade', foco: 'Competência 2 / Simulação de prova' },
    ],
  },
];

const OBSERVACOES_GERAL = [
  '📖 = Interpretação de Texto | ✍️ = Redação — os dois blocos acontecem no mesmo dia, um em seguida do outro.',
  'Não há aula em 04/09 (formação Selo Escola Antirracista); o conteúdo foi remanejado, e não removido — cada aula seguinte passou para o próximo dia de aula, com um novo encontro acrescentado em 18/11 ao final do cronograma.',
  'Não houve aula em 08/09 (aniversário do Domingues); o conteúdo das duas disciplinas foi remanejado para as aulas seguintes, e os conteúdos previstos para 18/11 foram retirados para dar espaço.',
  'Não houve aula em 11/09 (problemas técnicos: sala sem ar-condicionado e Domingues doente); o conteúdo das duas disciplinas foi remanejado para as aulas seguintes, e os simulados gerais (antes em 18/11) foram retirados para dar espaço.',
  '13/10 e 30/10 seguem sem aula nas duas disciplinas (o feriado do Dia do Servidor Público foi transferido de 28/10 para 30/10, e o conteúdo de 30/10 foi antecipado para 28/10; o dia sem aula antes previsto para 16/10 passou para 13/10; o conteúdo de 13/10 foi para 14/10 e o de 14/10 para 16/10).',
  'Em 23/09 a turma participou do projeto "Leitura é vida" nas duas disciplinas; o conteúdo foi remanejado para as aulas seguintes.',
  'Em 29/09 a turma participou do projeto "Memórias da resistência" nas duas disciplinas; o conteúdo foi remanejado para as aulas seguintes, e as duas últimas aulas de cada disciplina foram unidas em 18/11.',
  'Em 21/09 (segunda) houve um dia extra, fora da grade regular, dedicado ao planejamento das aulas de redação e interpretação de texto — destacado em azul claro.',
  'As linhas foram casadas para que o conteúdo de interpretação sirva de gancho para o de redação no mesmo dia (ex.: 15/09 — denotação/conotação na leitura é reaproveitada na escolha de palavras da escrita).',
];

const OBSERVACOES_REDACAO = [
  'Não haverá aula em 04/09 devido à formação para o Selo Escola Antirracista. O conteúdo foi remanejado (não removido), empurrando cada aula seguinte para o próximo dia de aula (ter/qua/sex) e acrescentando um novo encontro em 18/11 ao final do cronograma.',
  'Não houve aula em 08/09 devido ao aniversário do Domingues. O conteúdo foi remanejado, empurrando cada aula seguinte para o próximo dia de aula; para acomodar a mudança, a correção comentada das redações (antes em 18/11) foi retirada.',
  'Não houve aula em 11/09 devido a problemas técnicos (sala sem ar-condicionado e Domingues doente). O conteúdo foi remanejado da mesma forma, empurrando cada aula seguinte para o próximo dia de aula; para acomodar a mudança, o simulado geral de redação (antes em 18/11) foi retirado.',
  'Em 23/09 a turma participou do projeto "Leitura é vida". O conteúdo previsto para essa data foi remanejado, empurrando cada aula seguinte para o próximo dia de aula; para acomodar a mudança, a prática de parágrafo usando repertório legitimado (antes em 23/10) foi retirada.',
  'Em 29/09 a turma participou do projeto "Memórias da resistência". O conteúdo previsto para essa data foi remanejado, empurrando cada aula seguinte para o próximo dia de aula; para acomodar a mudança, os conteúdos das duas últimas aulas (dados/gráficos como repertório + produção de texto completo I) foram unidos em 18/11.',
  'Em 21/09 (segunda) houve um dia extra, fora da grade regular, dedicado ao planejamento das aulas de redação e interpretação de texto — destacado em azul claro. Nenhum conteúdo foi remanejado por causa dele.',
  'Não haverá aula em 13/10 (antes o dia sem aula previsto era 16/10). O conteúdo de 13/10 passou para 14/10 e o de 14/10 para 16/10. O feriado do Dia do Servidor Público foi transferido de 28/10 para 30/10: o conteúdo de 30/10 foi antecipado para 28/10, igual ao de interpretação de texto.',
  'A coluna "Conexão com interpretação" mostra o assunto visto na aula de interpretação do mesmo dia — útil para fazer a ponte entre as duas disciplinas na aula casada (ex.: em 15/09, "denotação e conotação" é visto na leitura e reaproveitado imediatamente na escolha de palavras da redação).',
  'As competências 1 a 5 citadas são as da matriz de correção da redação do Enem (domínio da norma culta; compreensão do tema; organização de argumentos; mecanismos linguísticos/coesão; proposta de intervenção) — o Enceja avalia critérios semelhantes de forma mais simplificada.',
  'Assim como no cronograma de interpretação, os blocos de "prática" são pontos de flexibilidade para reforço, caso a turma precise de mais tempo em algum tópico.',
];

interface GeralSession {
  date: string;
  day: string;
  interpretacao: string;
  redacao: string;
  noClass?: boolean;
  extra?: boolean; // dia extra fora da grade regular (ex.: planejamento)
}

interface SessionBase {
  date: string;
  day: string;
  noClass?: boolean;
  extra?: boolean;
}

// Conteúdo de uma aula, sem a data/dia do encontro (que ficam fixos na grade).
type Lesson<T extends SessionBase> = Omit<T, 'date' | 'day'>;

// Dias sem aula e dias extras ficam presos à sua data; só as demais aulas podem ser movidas.
const isFixedSession = (s: SessionBase) => Boolean(s.noClass || s.extra);

function buildGeral(interp: Week<InterpretacaoSession>[], redacao: Week<RedacaoSession>[]): Week<GeralSession>[] {
  return interp.map((week, wi) => ({
    title: week.title,
    sessions: week.sessions.map((s, si) => {
      const r = redacao[wi].sessions[si];
      return {
        date: s.date,
        day: s.day,
        interpretacao: s.content,
        redacao: r.content,
        noClass: s.noClass || r.noClass,
        extra: s.extra || r.extra,
      };
    }),
  }));
}

function toLesson<T extends SessionBase>(session: T): Lesson<T> {
  const { date: _date, day: _day, ...lesson } = session;
  return lesson as Lesson<T>;
}

function mapFlat<T>(weeks: Week<T>[], fn: (session: T, index: number) => T): Week<T>[] {
  let index = 0;
  return weeks.map(week => ({ ...week, sessions: week.sessions.map(s => fn(s, index++)) }));
}

// Move a aula da posição `from` para `to`, deslocando as aulas intermediárias.
// As posições marcadas em `fixed` não participam do deslocamento.
function moveLesson<T extends SessionBase>(weeks: Week<T>[], from: number, to: number, fixed: boolean[]): Week<T>[] {
  const flat = weeks.flatMap(w => w.sessions);
  const slots = flat.map((_, i) => i).filter(i => !fixed[i]);
  const fromPos = slots.indexOf(from);
  const toPos = slots.indexOf(to);
  if (fromPos < 0 || toPos < 0 || fromPos === toPos) return weeks;

  const order = [...slots];
  const [moved] = order.splice(fromPos, 1);
  order.splice(toPos, 0, moved);
  const sourceBySlot = new Map(slots.map((slot, k) => [slot, order[k]]));

  return mapFlat(weeks, (s, i) => {
    const source = sourceBySlot.get(i);
    return source === undefined ? s : ({ ...toLesson(flat[source]), date: s.date, day: s.day } as T);
  });
}

// Junta várias aulas em um único encontro, no mesmo formato usado em 18/11 ("A + B", "foco A / foco B").
function mergeLessons<T extends SessionBase>(lessons: Lesson<T>[]): Lesson<T> {
  const merged: Record<string, unknown> = { ...lessons[0] };
  Object.keys(merged).forEach(key => {
    const values = lessons.map(l => (l as any)[key]);
    if (values.every(v => typeof v === 'string')) {
      const parts = values.filter(v => v && v !== '—' && v !== '(a definir)');
      merged[key] = parts.length ? parts.join(key === 'content' ? ' + ' : ' / ') : '—';
    }
  });
  return merged as Lesson<T>;
}

// Marca a data `index` como sem aula: a aula dessa data e as seguintes passam para o próximo dia de aula.
// O conteúdo que sobrar no fim do cronograma é unido ao último encontro, para não se perder.
function markNoClass<T extends SessionBase>(
  weeks: Week<T>[],
  index: number,
  fixed: boolean[],
  noClassLesson: Lesson<T>
): Week<T>[] {
  const flat = weeks.flatMap(w => w.sessions);
  const slots = flat.map((_, i) => i).filter(i => !fixed[i]);
  const remaining = slots.filter(i => i !== index);
  if (!slots.includes(index) || remaining.length === 0) return weeks;

  const lessons = slots.map(i => toLesson(flat[i]));
  const fitted = [
    ...lessons.slice(0, remaining.length - 1),
    mergeLessons(lessons.slice(remaining.length - 1)),
  ];
  const lessonBySlot = new Map(remaining.map((slot, k) => [slot, fitted[k]]));

  return mapFlat(weeks, (s, i) => {
    if (i === index) return { ...noClassLesson, date: s.date, day: s.day } as T;
    const lesson = lessonBySlot.get(i);
    return lesson === undefined ? s : ({ ...lesson, date: s.date, day: s.day } as T);
  });
}

// Inverso de markNoClass: a data `index` passa a receber a aula seguinte e as demais recuam um dia;
// o último encontro fica com `placeholder` para ser preenchido.
function pullLessonsForward<T extends SessionBase>(
  weeks: Week<T>[],
  index: number,
  fixed: boolean[],
  placeholder: Lesson<T>
): Week<T>[] {
  const flat = weeks.flatMap(w => w.sessions);
  const slots = flat.map((_, i) => i).filter(i => !fixed[i] || i === index);
  const lessons = [...slots.filter(i => i !== index).map(i => toLesson(flat[i])), placeholder];
  const lessonBySlot = new Map(slots.map((slot, k) => [slot, lessons[k]]));

  return mapFlat(weeks, (s, i) => {
    const lesson = lessonBySlot.get(i);
    return lesson === undefined ? s : ({ ...lesson, date: s.date, day: s.day } as T);
  });
}

function sameLesson(a: object, b: object): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every(k => ((a as any)[k] ?? false) === ((b as any)[k] ?? false));
}

const SCHEDULE_YEAR = 2026;
const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const PLACEHOLDER_INTERPRETACAO: Lesson<InterpretacaoSession> = { content: '(a definir)', foco: '—' };
const PLACEHOLDER_REDACAO: Lesson<RedacaoSession> = { content: '(a definir)', conexao: '—', foco: '—' };

// Dia inserido pelo usuário além da grade padrão: aula regular (recebe conteúdo e pode receber aulas movidas)
// ou dia extra fora da grade (fixo, como o planejamento de 21/09).
interface AddedDay {
  date: string; // DD/MM
  day: string;
  extra?: boolean;
}

// "AAAA-MM-DD" (input type=date) → { date: "DD/MM", day: "Sexta" }
function addedDayFromIso(iso: string): Omit<AddedDay, 'extra'> {
  const [year, month, day] = iso.split('-').map(Number);
  return {
    date: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`,
    day: WEEKDAYS[new Date(year, month - 1, day).getDay()],
  };
}

// Insere os dias adicionados na semana em que caem, mantendo a ordem por data.
function insertAddedDays<T extends SessionBase>(
  weeks: Week<T>[],
  addedDays: AddedDay[],
  lessonFor: (day: AddedDay) => Lesson<T>
): Week<T>[] {
  const result = weeks.map(week => ({ ...week, sessions: [...week.sessions] }));
  addedDays.forEach(added => {
    const key = scheduleDateSortKey(added.date);
    let wi = 0;
    result.forEach((week, i) => {
      if (week.sessions.length && scheduleDateSortKey(week.sessions[0].date) <= key) wi = i;
    });
    result[wi].sessions.push({ ...lessonFor(added), date: added.date, day: added.day } as T);
    result[wi].sessions.sort((a, b) => scheduleDateSortKey(a.date) - scheduleDateSortKey(b.date));
  });
  return result;
}

function baseInterpretacao(addedDays: AddedDay[]) {
  return insertAddedDays(WEEKS_INTERPRETACAO, addedDays, d =>
    d.extra ? { content: 'Dia extra', foco: '—', extra: true } : PLACEHOLDER_INTERPRETACAO
  );
}

function baseRedacao(addedDays: AddedDay[]) {
  return insertAddedDays(WEEKS_REDACAO, addedDays, d =>
    d.extra ? { content: 'Dia extra', conexao: '—', foco: '—', extra: true } : PLACEHOLDER_REDACAO
  );
}

// Só as datas alteradas são salvas, para que ajustes futuros no cronograma padrão continuem aparecendo nas demais.
interface ScheduleOverrides {
  interpretacao: Record<string, Lesson<InterpretacaoSession>>;
  redacao: Record<string, Lesson<RedacaoSession>>;
  addedDays: AddedDay[];
}

const EMPTY_OVERRIDES: ScheduleOverrides = { interpretacao: {}, redacao: {}, addedDays: [] };

// Versão anterior salvava no navegador; esses dados são levados para o Firestore no primeiro acesso.
const LEGACY_STORAGE_KEY = 'classScheduleOverrides';

function loadLegacyOverrides(): ScheduleOverrides | null {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { interpretacao: parsed.interpretacao ?? {}, redacao: parsed.redacao ?? {}, addedDays: [] };
  } catch {
    return null;
  }
}

// No Firestore cada disciplina é guardada como lista de { date, ...aula }.
type StoredLesson = Record<string, unknown> & { date: string };

function toStored<T>(overrides: Record<string, T>): StoredLesson[] {
  // O Firestore rejeita campos `undefined`; o round-trip em JSON remove esses campos.
  return Object.entries(overrides).map(([date, lesson]) => JSON.parse(JSON.stringify({ date, ...lesson })));
}

function addedDaysFromStored(list: unknown): AddedDay[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter(item => typeof item?.date === 'string' && typeof item?.day === 'string')
    .map(item => ({ date: item.date, day: item.day, extra: item.extra === true }));
}

function fromStored<T>(list: unknown): Record<string, T> {
  if (!Array.isArray(list)) return {};
  return Object.fromEntries(
    list
      .filter((item): item is StoredLesson => typeof item?.date === 'string')
      .map(({ date, ...lesson }) => [date, lesson as T])
  );
}

async function saveOverrides(userId: string, overrides: ScheduleOverrides) {
  await setDoc(doc(db, 'schedules', userId), {
    interpretacao: toStored(overrides.interpretacao),
    redacao: toStored(overrides.redacao),
    addedDays: overrides.addedDays.map(d => (d.extra ? { ...d, extra: true } : { date: d.date, day: d.day })),
    updatedAt: serverTimestamp(),
  });
}

function applyOverrides<T extends SessionBase>(weeks: Week<T>[], overrides: Record<string, Lesson<T>>): Week<T>[] {
  return mapFlat(weeks, s => (overrides[s.date] ? ({ ...overrides[s.date], date: s.date, day: s.day } as T) : s));
}

function diffOverrides<T extends SessionBase>(defaults: Week<T>[], current: Week<T>[]): Record<string, Lesson<T>> {
  const defaultSessions = defaults.flatMap(w => w.sessions);
  const result: Record<string, Lesson<T>> = {};
  current.flatMap(w => w.sessions).forEach((s, i) => {
    if (!sameLesson(toLesson(s), toLesson(defaultSessions[i]))) result[s.date] = toLesson(s);
  });
  return result;
}

interface EditableColumn<T> {
  field: keyof T & string;
  header: string;
  muted?: boolean;
}

interface ScheduleWeeksProps<T extends SessionBase> {
  weeks: Week<T>[];
  columns: EditableColumn<T>[];
  onMove: (from: number, to: number) => void;
  onSave: (index: number, values: Record<string, string>) => void;
  onMarkNoClass: (index: number) => void;
  onUnmarkNoClass: (index: number) => void;
  addedDates: Set<string>;
  onRemoveDay: (index: number) => void;
}

function ScheduleWeeks<T extends SessionBase>({
  weeks,
  columns,
  onMove,
  onSave,
  onMarkNoClass,
  onUnmarkNoClass,
  addedDates,
  onRemoveDay,
}: ScheduleWeeksProps<T>) {
  const [editing, setEditing] = useState<{ index: number; values: Record<string, string> } | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const flat = weeks.flatMap(w => w.sessions);
  const movable = flat.map((_, i) => i).filter(i => !isFixedSession(flat[i]));
  const neighbor = (index: number, dir: -1 | 1): number | undefined => movable[movable.indexOf(index) + dir];
  const offsets = weeks.map((_, wi) => weeks.slice(0, wi).reduce((acc, w) => acc + w.sessions.length, 0));

  const startEditing = (index: number) => {
    const session = flat[index];
    setEditing({ index, values: Object.fromEntries(columns.map(c => [c.field, String(session[c.field] ?? '')])) });
  };

  const saveEditing = () => {
    if (!editing) return;
    onSave(editing.index, Object.fromEntries(Object.entries(editing.values).map(([k, v]) => [k, v.trim()])));
    setEditing(null);
  };

  const endDrag = () => {
    setDragFrom(null);
    setDragOver(null);
  };

  const iconButton =
    'p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:cursor-not-allowed';

  return (
    <>
      {weeks.map((week, wi) => (
        <div key={week.title} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4">{week.title}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <th className="py-2 px-1 w-6"></th>
                  <th className="py-2 px-3 whitespace-nowrap">Data</th>
                  <th className="py-2 px-3 whitespace-nowrap">Dia</th>
                  {columns.map(col => (
                    <th key={col.field} className="py-2 px-3">{col.header}</th>
                  ))}
                  <th className="py-2 px-3 text-right whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody>
                {week.sessions.map((session, si) => {
                  const index = offsets[wi] + si;
                  const fixed = isFixedSession(session);
                  const isEditing = editing?.index === index;
                  const canDrag = !fixed && editing === null;
                  const prev = neighbor(index, -1);
                  const next = neighbor(index, 1);
                  return (
                    <tr
                      key={session.date}
                      draggable={canDrag}
                      onDragStart={e => {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', String(index));
                        setDragFrom(index);
                      }}
                      onDragEnd={endDrag}
                      onDragOver={e => {
                        if (dragFrom === null || fixed) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOver !== index) setDragOver(index);
                      }}
                      onDrop={e => {
                        e.preventDefault();
                        if (dragFrom !== null && !fixed) onMove(dragFrom, index);
                        endDrag();
                      }}
                      className={`border-b border-slate-100 last:border-0 align-top ${session.noClass ? 'bg-amber-50/60 text-amber-800' : session.extra ? 'bg-sky-50 text-sky-800' : 'text-slate-700'} ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''} ${dragFrom === index ? 'opacity-40' : ''} ${dragOver === index && dragFrom !== index ? 'outline outline-2 -outline-offset-2 outline-[#00B37E]' : ''}`}
                    >
                      <td className="py-3 px-1 text-slate-300">
                        {!fixed && <GripVertical size={16} />}
                      </td>
                      <td className="py-3 px-3 font-bold whitespace-nowrap">
                        {session.date}
                        {addedDates.has(session.date) && (
                          <span className="block mt-1 text-[10px] font-bold uppercase tracking-wider text-[#00B37E]">
                            Adicionado
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">{session.day}</td>
                      {columns.map(col => (
                        <td key={col.field} className={`py-3 px-3 ${col.muted ? 'text-slate-500' : ''}`}>
                          {isEditing ? (
                            <textarea
                              value={editing.values[col.field]}
                              onChange={e =>
                                setEditing({ ...editing, values: { ...editing.values, [col.field]: e.target.value } })
                              }
                              onKeyDown={e => {
                                if (e.key === 'Escape') setEditing(null);
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) saveEditing();
                              }}
                              rows={3}
                              className="w-full min-w-[12rem] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00B37E]/40 focus:border-[#00B37E]"
                            />
                          ) : (
                            String(session[col.field] ?? '')
                          )}
                        </td>
                      ))}
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-end gap-0.5">
                          {isEditing ? (
                            <>
                              <button onClick={saveEditing} className={iconButton} title="Salvar (Ctrl+Enter)">
                                <Check size={16} />
                              </button>
                              <button onClick={() => setEditing(null)} className={iconButton} title="Cancelar (Esc)">
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => prev !== undefined && onMove(index, prev)}
                                disabled={fixed || prev === undefined || editing !== null}
                                className={iconButton}
                                title="Mover para a aula anterior"
                              >
                                <ChevronUp size={16} />
                              </button>
                              <button
                                onClick={() => next !== undefined && onMove(index, next)}
                                disabled={fixed || next === undefined || editing !== null}
                                className={iconButton}
                                title="Mover para a próxima aula"
                              >
                                <ChevronDown size={16} />
                              </button>
                              <button
                                onClick={() => startEditing(index)}
                                disabled={editing !== null}
                                className={iconButton}
                                title="Editar conteúdo"
                              >
                                <Pencil size={15} />
                              </button>
                              {session.noClass ? (
                                <button
                                  onClick={() => onUnmarkNoClass(index)}
                                  disabled={editing !== null}
                                  className={iconButton}
                                  title="Liberar data (voltar a ter aula e recuar as aulas seguintes)"
                                >
                                  <CalendarCheck size={15} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => onMarkNoClass(index)}
                                  disabled={fixed || editing !== null}
                                  className={iconButton}
                                  title="Marcar como sem aula (empurra as aulas seguintes)"
                                >
                                  <CalendarX size={15} />
                                </button>
                              )}
                              {addedDates.has(session.date) && (
                                <button
                                  onClick={() => onRemoveDay(index)}
                                  disabled={editing !== null}
                                  className={iconButton}
                                  title="Remover este dia do cronograma"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}

interface AddDayValues {
  iso: string; // AAAA-MM-DD
  extra: boolean;
  pullForward: boolean;
  interpretacao: string;
  redacao: string;
}

const EMPTY_ADD_DAY: AddDayValues = { iso: '', extra: false, pullForward: false, interpretacao: '', redacao: '' };

function AddDayForm({ onAdd, onClose }: { onAdd: (values: AddDayValues) => string | null; onClose: () => void }) {
  const [values, setValues] = useState<AddDayValues>(EMPTY_ADD_DAY);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<AddDayValues>) => {
    setValues(v => ({ ...v, ...patch }));
    setError(null);
  };
  const showContent = values.extra || !values.pullForward;
  const weekday = values.iso ? addedDayFromIso(values.iso).day : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onAdd(values);
    if (result) setError(result);
    else onClose();
  };

  const input =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00B37E]/40 focus:border-[#00B37E]';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-8 space-y-4">
      <h3 className="text-sm font-bold text-slate-800">Adicionar dia ao cronograma</h3>

      <div className="flex flex-wrap items-end gap-4">
        <label className="text-sm text-slate-600">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Data</span>
          <input
            type="date"
            value={values.iso}
            min={`${SCHEDULE_YEAR}-01-01`}
            max={`${SCHEDULE_YEAR}-12-31`}
            onChange={e => set({ iso: e.target.value })}
            className={input}
            required
          />
        </label>
        {weekday && <span className="text-sm text-slate-500 pb-2">{weekday}</span>}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-slate-600">
        <label className="flex items-center gap-2">
          <input type="radio" checked={!values.extra} onChange={() => set({ extra: false })} />
          Aula regular
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" checked={values.extra} onChange={() => set({ extra: true })} />
          Dia extra fora da grade (ex.: planejamento) — fica fixo, em azul
        </label>
      </div>

      {!values.extra && (
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="mt-1"
            checked={values.pullForward}
            onChange={e => set({ pullForward: e.target.checked })}
          />
          <span>
            Adiantar as aulas seguintes para este dia
            <span className="block text-xs text-slate-400">
              O novo dia recebe a próxima aula do cronograma e as demais recuam um dia; o último encontro fica
              "(a definir)".
            </span>
          </span>
        </label>
      )}

      {showContent && (
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              📖 Interpretação de Texto
            </span>
            <textarea
              rows={2}
              value={values.interpretacao}
              onChange={e => set({ interpretacao: e.target.value })}
              placeholder={values.extra ? 'Dia extra' : '(a definir)'}
              className={input}
            />
          </label>
          <label className="text-sm">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">✍️ Redação</span>
            <textarea
              rows={2}
              value={values.redacao}
              onChange={e => set({ redacao: e.target.value })}
              placeholder={values.extra ? 'Dia extra' : '(a definir)'}
              className={input}
            />
          </label>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-[#00B37E] text-white hover:bg-[#00966b] transition-colors"
        >
          <Check size={16} />
          Adicionar
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

const COLUMNS_INTERPRETACAO: EditableColumn<InterpretacaoSession>[] = [
  { field: 'content', header: 'Conteúdo' },
  { field: 'foco', header: 'Foco Enceja/Enem', muted: true },
];

const COLUMNS_REDACAO: EditableColumn<RedacaoSession>[] = [
  { field: 'content', header: 'Conteúdo' },
  { field: 'conexao', header: 'Conexão com interpretação', muted: true },
  { field: 'foco', header: 'Foco Enceja/Enem', muted: true },
];

const COLUMNS_GERAL: EditableColumn<GeralSession>[] = [
  { field: 'interpretacao', header: '📖 Interpretação de Texto' },
  { field: 'redacao', header: '✍️ Redação' },
];

const SUBJECT_OPTIONS: { id: Subject; label: string }[] = [
  { id: 'geral', label: 'Geral' },
  { id: 'interpretacao', label: 'Interpretação de Texto' },
  { id: 'redacao', label: 'Redação' },
];

export const ClassSchedule: React.FC<ClassScheduleProps> = ({ userId, onGenerateDoc, isGeneratingDoc }) => {
  const [subject, setSubject] = useState<Subject>('geral');
  const [overrides, setOverrides] = useState<ScheduleOverrides>(EMPTY_OVERRIDES);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'denied'>('idle');
  const [isAddingDay, setIsAddingDay] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    const unsubscribe = onSnapshot(
      doc(db, 'schedules', userId),
      snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setOverrides({
            interpretacao: fromStored(data.interpretacao),
            redacao: fromStored(data.redacao),
            addedDays: addedDaysFromStored(data.addedDays),
          });
        } else {
          const legacy = loadLegacyOverrides();
          setOverrides(legacy ?? EMPTY_OVERRIDES);
          if (legacy) {
            saveOverrides(userId, legacy)
              .then(() => localStorage.removeItem(LEGACY_STORAGE_KEY))
              .catch(error => console.error('Erro ao migrar cronograma para o Firestore:', error));
          }
        }
        setIsLoaded(true);
      },
      error => {
        console.error('Erro ao carregar cronograma do Firestore:', error);
        setSaveStatus((error as { code?: string })?.code === 'permission-denied' ? 'denied' : 'error');
        setIsLoaded(true);
      }
    );
    return () => unsubscribe();
  }, [userId]);

  const weeksInterpretacao = useMemo(
    () => applyOverrides(baseInterpretacao(overrides.addedDays), overrides.interpretacao),
    [overrides.addedDays, overrides.interpretacao]
  );
  const weeksRedacao = useMemo(
    () => applyOverrides(baseRedacao(overrides.addedDays), overrides.redacao),
    [overrides.addedDays, overrides.redacao]
  );
  const weeksGeral = useMemo(() => buildGeral(weeksInterpretacao, weeksRedacao), [weeksInterpretacao, weeksRedacao]);
  const addedDates = useMemo(() => new Set(overrides.addedDays.map(d => d.date)), [overrides.addedDays]);

  const hasChanges =
    Object.keys(overrides.interpretacao).length > 0 ||
    Object.keys(overrides.redacao).length > 0 ||
    overrides.addedDays.length > 0;

  const commit = (
    nextInterpretacao: Week<InterpretacaoSession>[],
    nextRedacao: Week<RedacaoSession>[],
    nextAddedDays: AddedDay[] = overrides.addedDays
  ) => {
    const next: ScheduleOverrides = {
      interpretacao: diffOverrides(baseInterpretacao(nextAddedDays), nextInterpretacao),
      redacao: diffOverrides(baseRedacao(nextAddedDays), nextRedacao),
      addedDays: nextAddedDays,
    };
    setOverrides(next);
    setSaveStatus('saving');
    saveOverrides(userId, next)
      .then(() => setSaveStatus('saved'))
      .catch(error => {
        console.error('Erro ao salvar cronograma no Firestore:', error);
        setSaveStatus((error as { code?: string })?.code === 'permission-denied' ? 'denied' : 'error');
      });
  };

  const fixedOf = <T extends SessionBase>(weeks: Week<T>[]) => weeks.flatMap(w => w.sessions).map(isFixedSession);

  // "Sem aula" vale para o dia inteiro: interpretação e redação são empurradas juntas, em qualquer aba.
  const handleMarkNoClass = (index: number) => {
    const { date } = weeksGeral.flatMap(w => w.sessions)[index];
    const motivo = window.prompt(
      `Marcar ${date} como sem aula? A aula desta data e as seguintes passam para o próximo dia de aula, nas duas disciplinas.\n\nMotivo (opcional):`,
      ''
    );
    if (motivo === null) return;
    const content = motivo.trim() ? `(sem aula — ${motivo.trim()})` : '(sem aula)';
    const fixed = fixedOf(weeksGeral);
    commit(
      markNoClass(weeksInterpretacao, index, fixed, { content, foco: '—', noClass: true }),
      markNoClass(weeksRedacao, index, fixed, { content, conexao: '—', foco: '—', noClass: true })
    );
  };

  const handleUnmarkNoClass = (index: number) => {
    const { date } = weeksGeral.flatMap(w => w.sessions)[index];
    if (
      !window.confirm(
        `Liberar ${date}? Essa data volta a ter aula e as aulas seguintes recuam um dia, nas duas disciplinas. O último encontro fica "(a definir)".`
      )
    )
      return;
    const fixed = fixedOf(weeksGeral);
    commit(
      pullLessonsForward(weeksInterpretacao, index, fixed, PLACEHOLDER_INTERPRETACAO),
      pullLessonsForward(weeksRedacao, index, fixed, PLACEHOLDER_REDACAO)
    );
  };

  // Retorna uma mensagem de erro, ou null se o dia foi adicionado.
  const handleAddDay = (form: AddDayValues): string | null => {
    if (!form.iso) return 'Escolha a data.';
    const { date, day } = addedDayFromIso(form.iso);
    if (Number(form.iso.slice(0, 4)) !== SCHEDULE_YEAR) return `A data precisa ser de ${SCHEDULE_YEAR}.`;
    if (weeksGeral.some(w => w.sessions.some(s => s.date === date))) return `${date} já está no cronograma.`;

    const nextAddedDays = [...overrides.addedDays, { date, day, extra: form.extra }];
    let nextInterpretacao = applyOverrides(baseInterpretacao(nextAddedDays), overrides.interpretacao);
    let nextRedacao = applyOverrides(baseRedacao(nextAddedDays), overrides.redacao);
    const index = nextInterpretacao.flatMap(w => w.sessions).findIndex(s => s.date === date);

    if (!form.extra && form.pullForward) {
      // O novo dia recebe a próxima aula e as seguintes recuam um dia.
      const fixed = fixedOf(buildGeral(nextInterpretacao, nextRedacao));
      nextInterpretacao = pullLessonsForward(nextInterpretacao, index, fixed, PLACEHOLDER_INTERPRETACAO);
      nextRedacao = pullLessonsForward(nextRedacao, index, fixed, PLACEHOLDER_REDACAO);
    } else {
      const interpretacao = form.interpretacao.trim();
      const redacao = form.redacao.trim();
      if (interpretacao) nextInterpretacao = mapFlat(nextInterpretacao, (s, i) => (i === index ? { ...s, content: interpretacao } : s));
      if (redacao) nextRedacao = mapFlat(nextRedacao, (s, i) => (i === index ? { ...s, content: redacao } : s));
    }

    commit(nextInterpretacao, nextRedacao, nextAddedDays);
    return null;
  };

  const handleRemoveDay = (index: number) => {
    const { date } = weeksGeral.flatMap(w => w.sessions)[index];
    if (!window.confirm(`Remover ${date} do cronograma? O conteúdo desta data também será removido.`)) return;
    const keep = <T extends SessionBase>(weeks: Week<T>[]) =>
      weeks.map(w => ({ ...w, sessions: w.sessions.filter(s => s.date !== date) }));
    commit(keep(weeksInterpretacao), keep(weeksRedacao), overrides.addedDays.filter(d => d.date !== date));
  };

  const handleReset = () => {
    if (
      !window.confirm(
        'Restaurar o cronograma original? Todas as aulas movidas e editadas e os dias adicionados serão desfeitos.'
      )
    )
      return;
    commit(WEEKS_INTERPRETACAO, WEEKS_REDACAO, []);
  };

  const handleGenerate = () => {
    if (subject === 'interpretacao') {
      onGenerateDoc({
        title: 'Cronos Estágio - Cronograma de Aulas (Interpretação de Texto)',
        headers: ['Data', 'Dia', 'Conteúdo', 'Foco Enceja/Enem'],
        rows: weeksInterpretacao.flatMap(week =>
          week.sessions.map(s => [s.date, s.day, s.content, s.noClass || s.extra ? '—' : s.foco])
        ),
      });
    } else if (subject === 'redacao') {
      onGenerateDoc({
        title: 'Cronos Estágio - Cronograma de Aulas (Redação)',
        headers: ['Data', 'Dia', 'Conteúdo', 'Conexão com Interpretação', 'Foco Enceja/Enem'],
        rows: weeksRedacao.flatMap(week =>
          week.sessions.map(s => [s.date, s.day, s.content, s.noClass || s.extra ? '—' : s.conexao, s.noClass || s.extra ? '—' : s.foco])
        ),
      });
    } else {
      onGenerateDoc({
        title: 'Cronos Estágio - Cronograma de Aulas (Geral)',
        headers: ['Data', 'Dia', 'Interpretação de Texto', 'Redação'],
        rows: weeksGeral.flatMap(week =>
          week.sessions.map(s => [s.date, s.day, s.interpretacao, s.redacao])
        ),
      });
    }
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
            <strong className="text-slate-700"> Período:</strong> 21/08 a 18/11 &nbsp;|&nbsp;
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

      <div className="flex flex-wrap items-center gap-2 mb-3">
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
        <span className="ml-auto text-xs text-slate-400 flex items-center gap-1.5">
          {saveStatus === 'saving' && (
            <>
              <Loader2 size={14} className="animate-spin" /> Salvando...
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <Check size={14} className="text-[#00B37E]" /> Salvo
            </>
          )}
          {saveStatus === 'error' && <span className="text-red-500">Erro ao sincronizar com o Firestore</span>}
          {saveStatus === 'denied' && (
            <span className="text-red-500">Sem permissão no Firestore — publique as regras de firestore.rules</span>
          )}
        </span>
        <button
          onClick={() => setIsAddingDay(true)}
          disabled={!isLoaded || isAddingDay}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          title="Inserir um dia a mais no cronograma"
        >
          <CalendarPlus size={16} />
          Adicionar dia
        </button>
        {hasChanges && (
          <button
            onClick={handleReset}
            disabled={!isLoaded}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            title="Desfazer todas as aulas movidas e editadas e os dias adicionados"
          >
            <RotateCcw size={16} />
            Restaurar original
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400 mb-6">
        Arraste as linhas (ou use as setas) para mover as aulas e clique no lápis para editar o conteúdo. Dias sem
        aula e dias extras ficam fixos na sua data. Use o ícone de calendário para marcar uma data como sem aula
        (as aulas seguintes são empurradas automaticamente) ou para liberá-la de novo, e em "Adicionar dia" para
        inserir um dia a mais. As alterações valem para as três abas e ficam salvas na sua conta.
      </p>

      {isAddingDay && <AddDayForm onAdd={handleAddDay} onClose={() => setIsAddingDay(false)} />}

      {!isLoaded ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
          <Loader2 size={18} className="animate-spin" /> Carregando cronograma...
        </div>
      ) : (
      <div className="space-y-8">
        {subject === 'interpretacao' && (
          <ScheduleWeeks
            key="interpretacao"
            weeks={weeksInterpretacao}
            columns={COLUMNS_INTERPRETACAO}
            onMove={(from, to) =>
              commit(moveLesson(weeksInterpretacao, from, to, fixedOf(weeksInterpretacao)), weeksRedacao)
            }
            onMarkNoClass={handleMarkNoClass}
            onUnmarkNoClass={handleUnmarkNoClass}
            addedDates={addedDates}
            onRemoveDay={handleRemoveDay}
            onSave={(index, values) =>
              commit(mapFlat(weeksInterpretacao, (s, i) => (i === index ? { ...s, ...values } : s)), weeksRedacao)
            }
          />
        )}

        {subject === 'redacao' && (
          <ScheduleWeeks
            key="redacao"
            weeks={weeksRedacao}
            columns={COLUMNS_REDACAO}
            onMove={(from, to) =>
              commit(weeksInterpretacao, moveLesson(weeksRedacao, from, to, fixedOf(weeksRedacao)))
            }
            onMarkNoClass={handleMarkNoClass}
            onUnmarkNoClass={handleUnmarkNoClass}
            addedDates={addedDates}
            onRemoveDay={handleRemoveDay}
            onSave={(index, values) =>
              commit(weeksInterpretacao, mapFlat(weeksRedacao, (s, i) => (i === index ? { ...s, ...values } : s)))
            }
          />
        )}

        {subject === 'geral' && (
          <ScheduleWeeks
            key="geral"
            weeks={weeksGeral}
            columns={COLUMNS_GERAL}
            onMove={(from, to) => {
              // Na aula casada, interpretação e redação do mesmo dia se movem juntas.
              const fixed = fixedOf(weeksGeral);
              commit(moveLesson(weeksInterpretacao, from, to, fixed), moveLesson(weeksRedacao, from, to, fixed));
            }}
            onMarkNoClass={handleMarkNoClass}
            onUnmarkNoClass={handleUnmarkNoClass}
            addedDates={addedDates}
            onRemoveDay={handleRemoveDay}
            onSave={(index, values) =>
              commit(
                mapFlat(weeksInterpretacao, (s, i) => (i === index ? { ...s, content: values.interpretacao } : s)),
                mapFlat(weeksRedacao, (s, i) => (i === index ? { ...s, content: values.redacao } : s))
              )
            }
          />
        )}
      </div>
      )}

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
