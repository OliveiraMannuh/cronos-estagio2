export type PlanningSubject = 'interpretacao' | 'redacao';

export interface PlanningLesson {
  date: string; // DD/MM
  day: string;
  subject: PlanningSubject;
  title: string;
  markdown: string;
}

export const PLANNING_LESSONS: PlanningLesson[] = [
  {
    date: '18/08',
    day: 'Terça',
    subject: 'interpretacao',
    title: 'Leitura x interpretação: decodificar, compreender e inferir',
    markdown: `**Tema:** Leitura x interpretação: decodificar, compreender e inferir
**Turma:** CEJA, com estudantes do 6º ano ao 3º ano do Ensino Médio
**Duração sugerida:** primeiro bloco de 50 a 60 minutos para interpretação e segundo bloco para redação
**Articulação:** a leitura e a inferência serão utilizadas como base para compreender o tema e formular a tese do texto dissertativo-argumentativo.

A principal estratégia para uma turma tão heterogênea é trabalhar com **um mesmo texto**, mas propor perguntas e níveis de aprofundamento diferentes. No CEJA, é importante relacionar o texto às experiências dos estudantes, aos gêneros que circulam em seu cotidiano e às situações concretas de trabalho, família, comunidade, escola e cidadania. Pesquisas sobre leitura na EJA destacam justamente a importância de considerar os conhecimentos construídos pelos alunos ao longo da vida e de trabalhar com gêneros socialmente significativos. [revista.uepb.edu](https://revista.uepb.edu.br/REDISC/article/view/3139)

## 1. Objetivos da aula

Ao final da aula, espera-se que os estudantes sejam capazes de:

- Diferenciar **decodificar**, **compreender** e **inferir**.
- Localizar informações explícitas em um texto.
- Identificar tema, finalidade e ideia principal.
- Relacionar informações do texto aos conhecimentos prévios.
- Formular inferências sustentadas por pistas textuais.
- Distinguir uma inferência possível de uma opinião sem apoio no texto.
- Perceber que interpretar não é "adivinhar o que o autor quis dizer".
- Utilizar informações explícitas e implícitas na construção de uma opinião ou tese.

A decodificação corresponde ao reconhecimento dos sinais linguísticos; a compreensão envolve a construção do sentido explícito; e a inferência exige relacionar pistas do texto a conhecimentos prévios para chegar a informações não declaradas diretamente. [anaisonline.uems](https://anaisonline.uems.br/seminarioformacaodocente/article/download/8890/8456/21228)

## 2. Conceitos para apresentar

Sugiro construir com a turma um quadro simples:

| Processo | Pergunta orientadora | Exemplo |
|---|---|---|
| **Decodificação** | O que está escrito? | Reconhecer palavras, frases, pontuação e sinais. |
| **Compreensão** | O que o texto diz diretamente? | Identificar quem fez algo, onde, quando e o quê. |
| **Inferência** | O que posso concluir a partir das pistas? | Perceber uma causa, intenção ou consequência não explicitada. |
| **Interpretação** | Como essas informações se relacionam? | Analisar tema, finalidade, ponto de vista, contexto e efeitos de sentido. |

Uma formulação acessível seria:

> **Decodificar é reconhecer a mensagem; compreender é entender o que está explícito; inferir é concluir algo que não está escrito diretamente, mas pode ser comprovado pelas pistas do texto.**

É importante deixar claro que a inferência precisa ser **justificada**. Uma resposta como "o personagem estava triste" só é válida se houver elementos que sustentem essa conclusão, como "falou pouco", "baixou a cabeça" ou "não respondeu às mensagens".

Também pode ser estabelecida uma relação com Paulo Freire: a leitura da palavra não se separa da leitura do mundo. Isso permite valorizar o repertório dos alunos sem substituir as evidências do texto por experiências pessoais. [scielo](https://www.scielo.br/j/es/a/QZBhvBTZYjsjJTpgm3Tbgzs/?format=html&lang=pt)

## 3. Desenvolvimento da aula

### Etapa 1 — Acolhida e diagnóstico: "O que significa ler?"
**Tempo:** 8 minutos

Escreva no quadro:

> **Ler é apenas pronunciar corretamente as palavras?**

Peça que os estudantes respondam oralmente ou escrevam uma frase breve. Em seguida, apresente três situações:

1. Uma pessoa lê uma mensagem em voz alta, mas não sabe explicar o que ela significa.
2. Um estudante entende as informações principais de um aviso.
3. Uma leitora percebe que um anúncio tenta convencê-la a comprar determinado produto.

Pergunte:

- Em qual situação houve apenas decodificação?
- Em qual houve compreensão?
- Em qual houve interpretação e análise de intenção?

Essa atividade funciona como diagnóstico sem transformar o início da aula em uma avaliação formal.

### Etapa 2 — Leitura de um texto curto
**Tempo:** 10 minutos

Utilize um texto de circulação social próximo da realidade dos alunos. Pode ser uma notícia breve, um aviso público, uma postagem institucional, uma campanha de saúde ou um anúncio de serviço.

Como alternativa, o professor pode criar um pequeno texto para a aula:

> **Aviso aos moradores**
> A coleta de lixo do bairro será realizada às terças, quintas e sábados, sempre a partir das 18 horas. Para evitar o acúmulo de resíduos nas calçadas, os moradores devem colocar os sacos de lixo apenas no final da tarde. A colaboração de todos ajuda a manter as ruas limpas e reduz a presença de animais.

Faça uma primeira leitura silenciosa. Depois, realize uma leitura compartilhada, sem constranger estudantes com dificuldades de fluência. O objetivo não deve ser expor quem lê mais devagar, mas observar como diferentes leitores constroem sentidos.

Antes da leitura, explore o título ou a situação comunicativa:

- Quem provavelmente escreveu esse texto?
- Para quem ele foi escrito?
- Onde esse texto poderia circular?
- Qual problema parece motivar sua produção?

A antecipação de hipóteses, a localização de informações relevantes e a verificação dessas hipóteses são estratégias produtivas para desenvolver a compreensão leitora. [pt.scribd](https://pt.scribd.com/doc/66620872/Leitura-e-Interpretacao-de-Textos)

### Etapa 3 — Três camadas de perguntas
**Tempo:** 20 minutos

Organize as perguntas em três níveis. Essa divisão ajuda a atender alunos de diferentes etapas sem separar a turma em grupos "fortes" e "fracos".

#### A. Questões de decodificação e localização

- Qual é o assunto geral do texto?
- Em quais dias ocorre a coleta?
- A partir de que horário ela será realizada?
- O que os moradores devem fazer?

Essas perguntas verificam a identificação de palavras, informações e relações explícitas.

#### B. Questões de compreensão

- Qual é a finalidade do aviso?
- Quem é o responsável pela ação mencionada?
- Qual orientação é dada aos moradores?
- Que relação existe entre colocar o lixo no fim da tarde e manter as ruas limpas?

Nesse momento, os estudantes precisam organizar as informações e compreender a relação entre as partes do texto.

#### C. Questões de inferência e interpretação

- Por que o texto recomenda que o lixo não seja colocado muito cedo?
- O que se pode inferir sobre um possível problema do bairro?
- A expressão "a colaboração de todos" produz que efeito?
- O texto apenas informa ou também procura convencer os moradores?
- Que consequência pode ocorrer se a orientação não for seguida?

Peça que cada resposta inferencial seja acompanhada de uma justificativa:

> **Minha resposta é ______ porque o texto apresenta a pista ______.**

Essa estrutura reduz o "chute" e ensina o estudante a voltar ao texto.

## 4. Atividade principal: "Está no texto ou posso concluir?"

**Tempo:** 12 minutos

Apresente afirmações sobre o aviso e peça que os alunos classifiquem cada uma como:

- **E — explícita:** está escrita diretamente;
- **I — inferida:** não está escrita, mas pode ser concluída;
- **N — não autorizada:** não há elementos suficientes para afirmá-la.

Exemplos:

1. A coleta acontece três vezes por semana. **E**
2. O bairro enfrenta problemas relacionados ao lixo. **I**
3. Todos os moradores desrespeitam os horários de coleta. **N**
4. O aviso pretende orientar a comunidade. **I ou E**, dependendo da justificativa apresentada.
5. A coleta é feita pela prefeitura. **N**, pois o texto não informa quem realiza o serviço.

A discussão da quinta afirmação é especialmente importante: os alunos percebem que uma informação pode parecer provável, mas não estar autorizada pelo texto.

## 5. Diferenciação para a turma multisseriada

### Para estudantes com maior dificuldade de leitura

- Use textos curtos, com fonte ampliada e organização visual clara.
- Leia o texto em voz alta e permita a leitura silenciosa antes da discussão.
- Trabalhe inicialmente com perguntas literais: quem, o quê, quando, onde e por quê.
- Destaque palavras-chave e peça que o estudante localize o trecho correspondente.
- Aceite respostas orais antes de exigir uma resposta escrita mais elaborada.
- Evite associar dificuldade de leitura à incapacidade intelectual.

### Para estudantes do Ensino Fundamental II

- Explore tema, finalidade, informações principais e relações de causa e consequência.
- Solicite respostas completas, mas sem exigir inicialmente terminologia complexa.
- Peça que transformem uma informação do texto em uma frase com suas próprias palavras.
- Trabalhe a diferença entre "o texto afirma" e "eu acho".

### Para estudantes do Ensino Médio

- Analise locutor, interlocutor, contexto, finalidade e ponto de vista.
- Solicite que identifiquem estratégias de convencimento.
- Peça que formulem uma inferência e indiquem a evidência textual correspondente.
- Relacione a atividade à redação: "Qual problema aparece no texto? Que posicionamento poderíamos defender sobre ele?"
- Introduza a distinção entre tema e tese, preparando a atividade do segundo bloco.

O trabalho com gêneros textuais socialmente situados é particularmente adequado à EJA, pois permite relacionar leitura e escrita às práticas efetivas dos estudantes, e não apenas a exercícios descontextualizados. [revista.uepb.edu](https://revista.uepb.edu.br/REDISC/article/view/3139)

## 6. Articulação com a redação

No segundo bloco, faça a transição com uma pergunta:

> **Se o texto apresenta um problema da comunidade, como poderíamos defender uma opinião sobre ele?**

A partir do aviso, proponha o tema:

> **A responsabilidade da comunidade na preservação dos espaços públicos.**

Conduza os alunos pelas seguintes etapas:

1. **Identificação do tema:** cuidado com os espaços públicos.
2. **Levantamento de uma questão:** de quem é a responsabilidade pela limpeza?
3. **Discussão de posições possíveis:** responsabilidade do poder público, dos moradores ou de ambos.
4. **Formulação de uma tese:** "A preservação dos espaços públicos depende da ação conjunta do poder público e da comunidade."
5. **Produção de uma frase argumentativa:** "Quando os moradores respeitam os horários de coleta, contribuem para reduzir o acúmulo de lixo e os riscos à saúde."

Assim, a interpretação não fica isolada da redação: o estudante compreende que interpretar um texto também significa identificar problemas, relações e posicionamentos que podem alimentar a produção escrita.

## 7. Avaliação formativa

Ao final da aula, utilize um "bilhete de saída" com três itens:

1. **Decodificar é:**
2. **Compreender é:**
3. **Uma inferência possível sobre o texto é ______, porque ______.**

Avalie principalmente se o estudante:

- Localiza informações no texto.
- Diferencia informação explícita de conclusão inferida.
- Justifica sua resposta com base em uma pista textual.
- Consegue explicar o tema com palavras próprias.
- Participa da discussão respeitando diferentes leituras.

O erro deve ser utilizado para perguntar: **"Que trecho fez você pensar isso?"** Essa pergunta desloca a correção da simples indicação de certo ou errado para o processo de construção da resposta.

## 8. Materiais

- Texto impresso em duas versões: uma regular e outra com fonte ampliada.
- Quadro ou projetor.
- Cartões com as letras **E**, **I** e **N**.
- Marcadores ou lápis de cores diferentes.
- Folha de atividade com perguntas graduadas.
- Dicionário físico ou digital, se disponível.

Uma boa opção é preparar dois textos sobre o mesmo tema: um aviso ou notícia breve e uma imagem de campanha. Entretanto, para a aula inicial, recomendo começar com um texto predominantemente verbal e deixar a leitura multimodal para o momento do cronograma em que esse conteúdo será trabalhado.

## Referências recomendadas

Em formato próximo ao padrão ABNT:

- BRASIL. Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira. **Matriz de competências e habilidades de Língua Portuguesa do Encceja**. Brasília, DF: Inep. A matriz oficial pode orientar a seleção de habilidades relacionadas à leitura, à localização de informações e à construção de sentidos. [gov](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/encceja/outros-documentos)
- FREIRE, Paulo. **A importância do ato de ler: em três artigos que se completam**. São Paulo: Cortez, 1989.
- KLEIMAN, Angela. **Oficina de leitura: teoria e prática**. Campinas: Pontes, 2002.
- KOCH, Ingedore Villaça; ELIAS, Vanda Maria. **Ler e compreender: os sentidos do texto**. São Paulo: Contexto, 2006.
- MARCUSCHI, Luiz Antônio. **Produção textual, análise de gêneros e compreensão**. São Paulo: Parábola, 2008.
- SOLÉ, Isabel. **Estratégias de leitura**. Porto Alegre: Artmed, 1998.
- SCHNEUWLY, Bernard; DOLZ, Joaquim. **Gêneros orais e escritos na escola**. Campinas: Mercado de Letras, 2004. A proposta de sequência didática desses autores organiza o trabalho em apresentação da situação, produção inicial, módulos de aprendizagem e produção final. [repositorio.ufrn](https://repositorio.ufrn.br/bitstream/123456789/42507/2/Produ%C3%A7%C3%A3o%20de%20g%C3%AAneros%20textuais%20na%20educa%C3%A7%C3%A3o%20de%20jovens%20e%20adultos%20(EJA)_Relat%C3%B3rio%20de%20Pr%C3%A1ticas%20Educacionais_2016.pdf)

### Síntese da proposta

A aula pode seguir este percurso:

> **vivência dos alunos → leitura de texto real → localização de informações → compreensão das relações → inferências justificadas → identificação de tema e problema → formulação de tese.**

Essa sequência é adequada ao CEJA porque não reduz a aula à leitura mecânica nem presume que todos os estudantes estejam no mesmo nível. Ela permite que cada aluno participe do mesmo texto, com diferentes graus de complexidade e aprofundamento.
`,
  },
];
