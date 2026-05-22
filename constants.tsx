
import { JourneyDay } from './types';
import { 
  Moon, 
  Sparkles, 
  Ghost, 
  Zap, 
  Heart, 
  Eye, 
  Activity, 
  Apple, 
  Droplets, 
  FlaskConical, 
  Sun, 
  Footprints,
  CloudLightning
} from 'lucide-react';

export interface Ritual {
  id: string;
  label: string;
  icon: any;
  desc: string;
  color: string;
  bg: string;
}

export const RITUALS: Ritual[] = [
  { id: 'purification', label: 'Purificação e Hidratação', icon: Droplets, desc: 'Corte 2 a 3 lâminas finas de alho e tome com água em jejum (como comprimidos) + 3L de água solarizada.', color: 'text-aura-teal', bg: 'bg-aura-teal/10' },
  { id: 'nourishment', label: 'Nutrição Consciente', icon: Apple, desc: 'Alimentar o templo com vida e pureza.', color: 'text-aura-gold', bg: 'bg-aura-gold/10' },
  { id: 'nature', label: 'Conexão com a Natureza', icon: Sun, desc: 'Sol e pés na terra para ancorar sua luz.', color: 'text-aura-emerald', bg: 'bg-aura-emerald/10' },
  { id: 'presence', label: 'Presença e Quietude', icon: Eye, desc: 'Silêncio e meditação no aqui e agora.', color: 'text-aura-indigo', bg: 'bg-aura-indigo/10' },
  { id: 'shadowWork', label: 'Integração da Sombra', icon: CloudLightning, desc: 'Observar gatilhos e emoções densas.', color: 'text-aura-rose', bg: 'bg-aura-rose/10' },
  { id: 'study', label: 'Estudo Hermético', icon: Zap, desc: 'Expandir a consciência através do estudo.', color: 'text-aura-gold', bg: 'bg-aura-gold/10' },
  { id: 'gratitude', label: 'Voto de Gratidão', icon: Heart, desc: 'Reconhecer a abundância em cada detalhe.', color: 'text-aura-rose', bg: 'bg-aura-rose/10' },
];

export const INITIAL_JOURNEY: JourneyDay[] = [
  {
    day: 1,
    title: "O Chamado do Templo",
    theme: "Consciência Corporal",
    description: "Hoje iniciamos a escuta profunda do seu corpo. O templo físico é o primeiro degrau da ascensão. Começamos o ciclo de 21 dias de purificação.",
    task: "Elimine completamente glúten, leite de vaca, açúcar, ultraprocessados e óleos vegetais. Observe como seu nível de energia se comporta.",
    reflection: "O que meu corpo está tentando me dizer através do cansaço ou do vigor ao retirar esses gatilhos?",
    completed: false
  },
  {
    day: 2,
    title: "A Alquimia Solar",
    theme: "Hidratação Vital",
    description: "A água solarizada é o condutor da luz líquida. Limpar os canais internos permite que a essência flua sem obstruções.",
    task: "Beba 3 litros de água solarizada (exposta ao sol por 30-60 min em vidro). Mantenha a retirada dos alimentos inflamatórios.",
    reflection: "Como me sinto ao nutrir minhas águas internas com a energia do Sol?",
    completed: false
  },
  {
    day: 3,
    title: "O Vazio Sagrado",
    theme: "Silêncio",
    description: "No silêncio, a voz da alma se torna audível. O ruído externo abafa a verdade interna.",
    task: "Pratique 15 minutos de silêncio absoluto, sem telas ou distrações, logo ao acordar.",
    reflection: "Quais pensamentos surgem quando não há ruído para me distrair de mim mesmo?",
    completed: false
  },
  {
    day: 4,
    title: "Alquimia Alimentar",
    theme: "Vitalidade",
    description: "Cada alimento carrega uma frequência. Escolha a vida para gerar vida.",
    task: "Consuma apenas alimentos vivos (crus) até o pôr do sol. Sinta a vibração da terra.",
    reflection: "Sinto diferença na minha clareza mental ao comer alimentos mais puros?",
    completed: false
  },
  {
    day: 5,
    title: "O Sopro da Vida",
    theme: "Prana",
    description: "A respiração é a ponte entre o visível e o invisível. Respire com intenção.",
    task: "Realize 3 ciclos de respiração consciente (4-4-8) em 4 momentos diferentes do dia.",
    reflection: "Consigo sentir a energia vital entrando em minhas células através do ar?",
    completed: false
  },
  {
    day: 6,
    title: "Raízes na Terra",
    theme: "Aterramento",
    description: "Para tocar o céu, é preciso ter raízes profundas. Conecte-se com a Gaia.",
    task: "Caminhe descalço na grama ou terra por 10 minutos, visualizando raízes saindo dos seus pés.",
    reflection: "Sinto-me mais seguro e presente quando me conecto fisicamente com a Terra?",
    completed: false
  },
  {
    day: 7,
    title: "O Portal do Descanso",
    theme: "Renovação",
    description: "O sono é uma pequena morte e um grande renascimento. Prepare seu altar de repouso.",
    task: "Desligue todas as luzes artificiais e telas 1 hora antes de dormir. Use apenas luz de velas ou penumbra.",
    reflection: "Como a qualidade do meu descanso afeta minha percepção da realidade?",
    completed: false
  },
  {
    day: 8,
    title: "O Movimento da Alma",
    theme: "Fluidez",
    description: "A rigidez no corpo reflete a rigidez na mente. Movimente-se com prazer.",
    task: "Pratique 20 minutos de movimentos livres e fluidos, sem julgamento, seguindo o ritmo do seu corpo.",
    reflection: "Onde no meu corpo eu sinto bloqueios e como posso convidá-los a fluir?",
    completed: false
  },
  {
    day: 9,
    title: "A Visão Interna",
    theme: "Intuição",
    description: "O terceiro olho vê o que os olhos físicos ignoram. Confie na sua percepção sutil.",
    task: "Feche os olhos e tente 'ver' a cor da sua energia atual. Não force, apenas observe.",
    reflection: "Quantas vezes hoje eu ignorei minha intuição em favor da lógica?",
    completed: false
  },
  {
    day: 10,
    title: "O Fogo da Vontade",
    theme: "Poder Pessoal",
    description: "Sua vontade é o motor da sua transformação. Honre seus compromissos consigo mesmo.",
    task: "Identifique um hábito que drena sua energia e decida conscientemente não praticá-lo hoje.",
    reflection: "Sinto-me mais forte quando exerço o domínio sobre meus impulsos inferiores?",
    completed: false
  },
  {
    day: 11,
    title: "O Coração Radiante",
    theme: "Amor Próprio",
    description: "O amor é a frequência de cura mais alta. Comece amando a si mesmo incondicionalmente.",
    task: "Olhe-se no espelho por 2 minutos e diga: 'Eu te vejo, eu te honro, eu te amo'.",
    reflection: "Qual a maior barreira que eu coloco para não me amar plenamente?",
    completed: false
  },
  {
    day: 12,
    title: "A Voz da Verdade",
    theme: "Expressão",
    description: "Sua palavra tem poder criador. Fale sua verdade com amor e clareza.",
    task: "Escreva uma carta para sua versão do passado, perdoando-a por algo que ainda gera peso.",
    reflection: "O que eu deixo de dizer por medo do julgamento alheio?",
    completed: false
  },
  {
    day: 13,
    title: "A Dança das Sombras",
    theme: "Integração",
    description: "Sua sombra contém tesouros escondidos. Não a tema, integre-a.",
    task: "Identifique uma característica que você detesta nos outros e veja como ela habita em você.",
    reflection: "Como posso acolher minha sombra sem permitir que ela assuma o controle?",
    completed: false
  },
  {
    day: 14,
    title: "O Templo da Gratidão",
    theme: "Abundância",
    description: "A gratidão abre as portas para a abundância infinita do universo.",
    task: "Liste 21 coisas pelas quais você é grato hoje, desde as mais simples até as mais profundas.",
    reflection: "Como o foco no que eu já tenho muda minha vibração de escassez para abundância?",
    completed: false
  },
  {
    day: 15,
    title: "A Presença Radical",
    theme: "O Agora",
    description: "A vida só acontece no presente. O passado é memória, o futuro é projeção.",
    task: "Escolha uma atividade rotineira (como lavar louça) e faça-a com 100% de atenção plena.",
    reflection: "Quantos momentos da minha vida eu perco por estar mentalmente em outro lugar?",
    completed: false
  },
  {
    day: 16,
    title: "O Escudo Energético",
    theme: "Proteção",
    description: "Você é um ser sensível. Aprenda a proteger seu campo de influências externas.",
    task: "Visualize uma bolha de luz dourada ao seu redor que permite a entrada de amor e barra o que é denso.",
    reflection: "Sinto-me drenado por ambientes ou pessoas? Como posso manter minha soberania energética?",
    completed: false
  },
  {
    day: 17,
    title: "A Conexão Estelar",
    theme: "Expansão",
    description: "Você é poeira estelar consciente. Lembre-se da sua origem cósmica.",
    task: "Observe o céu noturno por 10 minutos e sinta a vastidão do universo dentro de você.",
    reflection: "Qual o tamanho real dos meus problemas diante da imensidão do cosmos?",
    completed: false
  },
  {
    day: 18,
    title: "O Propósito Manifesto",
    theme: "Dharma",
    description: "Você veio aqui com um propósito único. O que sua alma anseia por realizar?",
    task: "Se dinheiro e tempo não fossem obstáculos, o que você estaria fazendo agora?",
    reflection: "O que me impede de dar o primeiro passo em direção ao meu propósito real?",
    completed: false
  },
  {
    day: 19,
    title: "A Unidade do Ser",
    theme: "Não-Dualidade",
    description: "A separação é uma ilusão. Somos todos fios da mesma teia da vida.",
    task: "Pratique um ato de bondade anônimo e sinta a conexão com o outro ser.",
    reflection: "Onde eu vejo separação, como posso começar a ver unidade?",
    completed: false
  },
  {
    day: 20,
    title: "A Maestria de Si",
    theme: "Soberania",
    description: "Você é o mestre do seu destino. Assuma a responsabilidade total pela sua jornada.",
    task: "Reveja sua jornada até aqui e identifique sua maior vitória interna nestes 20 dias.",
    reflection: "Estou pronto para ser o mestre da minha própria vida?",
    completed: false
  },
  {
    day: 21,
    title: "O Renascimento da Essência",
    theme: "Ascensão",
    description: "A jornada nunca termina, ela apenas se eleva. Você é um novo ser.",
    task: "Realize um pequeno ritual de celebração. Você completou o ciclo de 21 dias.",
    reflection: "Quem sou eu agora, comparado a quem eu era há 21 dias?",
    completed: false
  }
];
