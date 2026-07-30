import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DailyLog, Ritual, DailyInsight, DailyContent, Recipe } from "../types";

// Only initialize Gemini API client when running on the server (node/express context)
const ai = typeof window === "undefined" ? new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    }
  }
}) : null;

// Helpers for caching and robust recovery
function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

async function generateContentWithModelFallback(
  paramsBuilder: (modelName: string) => any
): Promise<any> {
  if (!ai) throw new Error("Gemini AI client not initialized");
  const models = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash"];
  let lastError: any = null;

  for (const model of models) {
    try {
      const params = paramsBuilder(model);
      const response = await ai.models.generateContent(params);
      if (response) return response;
    } catch (error: any) {
      lastError = error;
      const errorMsg = (error?.message || JSON.stringify(error) || "").toLowerCase();
      if (
        errorMsg.includes("429") ||
        errorMsg.includes("quota") ||
        errorMsg.includes("resource_exhausted") ||
        errorMsg.includes("limit")
      ) {
        console.warn(`[Gemini API] Quota/Rate limit on model ${model}, trying next fallback model...`);
        continue;
      }
      if (errorMsg.includes("503") || errorMsg.includes("unavailable")) {
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      break;
    }
  }
  throw lastError || new Error("All Gemini models failed");
}

// Default High-Quality Portuguese Fallbacks
const DEFAULT_DAILY_INSIGHT: DailyInsight = {
  oracleMessage: "Olhe para dentro. Nas profundezas do seu silêncio habita a verdade imutável do seu ser.",
  dailyExercise: "Pressione suavemente a ponta da língua no palato e respire pelo nariz de forma lenta por cinco ciclos.",
  dailyRitual: {
    type: "Meditação",
    title: "Ritual do Alvorecer Cósmico",
    elements: ["Copo de água morna", "Espaço silencioso"],
    process: [
      "Ao acordar, sente-se ereto em silêncio.",
      "Beba o copo de água morna agradecendo por mais um dia no templo.",
      "Respire fundo por 5 minutos visualizando uma luz dourada no peito."
    ],
    purpose: "Ancorar a presença e a paz no início do dia."
  },
  shadowPrompt: "Qual medo ou sombra do passado estou permitindo que controle minhas escolhas de hoje?"
};

const DEFAULT_DAILY_CONTENT: DailyContent = {
  motivation: "Sua saúde é o seu altar. Trate o seu templo físico com a reverência que ele merece hoje.",
  dailyChallenge: "Mastigue cada garfada pelo menos 30 vezes e coma em absoluto silêncio.",
  menu: [
    {
      title: "Creme de Abacate Ancestral",
      type: "Desjejum",
      ingredients: ["1/2 abacate maduro", "Suco de 1/2 limão", "1 colher de sopa de mel silvestre", "Sementes de girassol torradas"],
      instructions: [
        "Amasse o abacate com um garfo até ficar homogêneo.",
        "Misture o suco de limão e o mel incorporando levemente.",
        "Finalize com sementes de girassol por cima para dar textura e energia."
      ],
      prepTime: "5 min"
    },
    {
      title: "Escondidinho de Mandioca com Frango Desfiado",
      type: "Almoço",
      ingredients: ["300g de mandioca cozida", "150g de peito de frango cozido e desfiado", "Cebola, alho, cúrcuma e sal marinho", "Azeite de oliva extra virgem"],
      instructions: [
        "Amasse a mandioca cozida com um pouco da água do cozimento até formar um purê macio.",
        "Refogue o frango desfiado com cebola, alho, cúrcuma e sal no azeite.",
        "Em um refratário, coloque o frango refogado e cubra com o purê de mandioca.",
        "Leve ao forno por 15 minutos para dourar levemente."
      ],
      prepTime: "25 min"
    },
    {
      title: "Sopa de Abóbora com Gengibre Regeneradora",
      type: "Jantar",
      ingredients: ["400g de abóbora cabotiá picada", "1 pedaço pequeno de gengibre fresco ralado", "1 cebola picada", "Sal marinho e azeite de oliva"],
      instructions: [
        "Refogue a cebola e o gengibre ralado com azeite em uma panela média.",
        "Adicione a abóbora picada, cubra com água filtrada e cozinhe até ficar bem macia.",
        "Bata tudo no liquidificador até obter um creme sedoso.",
        "Sirva quente com um fio de azeite extra virgem."
      ],
      prepTime: "20 min"
    }
  ]
};

const DEFAULT_FERMENTATION_RECIPE: Recipe = {
  title: "Kefir de Água do Templo",
  type: "Fermentação Probiótica",
  ingredients: ["500ml de água filtrada", "2 colheres de sopa de açúcar mascavo integral", "2 colheres de grãos de kefir de água"],
  instructions: [
    "Dissolva o açúcar mascavo na água em um pote de vidro.",
    "Adicione os grãos de kefir e cubra com um pano limpo preso por elástico.",
    "Deixe fermentar em local escuro por 24 a 48 horas.",
    "Coe os grãos e consuma a bebida probiótica refrescante."
  ]
};

const DEFAULT_PURIFICATION_TIPS: string[] = [
  "Beba um copo de água morna com limão pela manhã para despertar o sistema digestivo.",
  "Mastigue sementes de mamão frescas pela manhã para liberação de emulsinas e enzimas purificadoras.",
  "Mantenha jejum noturno de 12 a 16 horas para permitir a autofagia e regeneração celular.",
  "Evite ingerir líquidos frios durante as refeições principais para preservar o fogo digestivo.",
  "Consuma chás amargos (como dente-de-leão, carqueja ou alcachofra) antes das principais refeições."
];

const DEFAULT_RECIPE_OPTIONS: Record<string, Recipe[]> = {
  "Desjejum": [
    {
      title: "Panqueca de Banana e Linhaça",
      type: "Desjejum",
      ingredients: ["1 banana madura amassada", "2 colheres de sopa de farinha de linhaça", "1 ovo (ou 1 colher de chia hidratada)", "Canela em pó a gosto", "Óleo de coco para grelhar"],
      instructions: [
        "Misture bem a banana amassada, a linhaça e a canela.",
        "Aqueça uma frigideira com um pouco de óleo de coco.",
        "Coloque porções da massa e grelhe dos dois lados até dourar."
      ],
      prepTime: "8 min"
    },
    {
      title: "Vitamina de Amêndoas e Frutas Vermelhas",
      type: "Desjejum",
      ingredients: ["200ml de leite de amêndoas caseiro", "1/2 xícara de morangos ou mirtilos", "1 colher de sopa de sementes de chia", "Mel a gosto"],
      instructions: [
        "Bata todos os ingredientes no liquidificador até obter uma bebida cremosa.",
        "Sirva gelado, decorado com algumas sementes extras."
      ],
      prepTime: "5 min"
    }
  ],
  "Almoço": [
    {
      title: "Tigela Nutritiva de Quinoa com Legumes",
      type: "Almoço",
      ingredients: ["1 xícara de quinoa cozida", "1/2 xícara de grão-de-bico cozido", "Abobrinha e cenoura grelhadas no azeite", "Sementes de abóbora tostadas", "Sal marinho e cúrcuma"],
      instructions: [
        "Misture a quinoa cozida quente com os legumes grelhados.",
        "Adicione o grão-de-bico temperado com cúrcuma e azeite.",
        "Finalize com sementes de abóbora."
      ],
      prepTime: "20 min"
    },
    {
      title: "Filé de Peixe com Purê de Mandioquinha",
      type: "Almoço",
      ingredients: ["1 filé de peixe grelhado no azeite", "200g de mandioquinha cozida e espremida", "Alho-poró picado", "Sal marinho e noz-moscada"],
      instructions: [
        "Refogue o alho-poró no azeite e misture à mandioquinha espremida com um pouco de água para formar o purê.",
        "Grelhe o peixe temperado com limão e sal.",
        "Sirva o peixe acompanhado do purê."
      ],
      prepTime: "25 min"
    }
  ],
  "Jantar": [
    {
      title: "Sopa Creme de Abobrinha com Ervas",
      type: "Jantar",
      ingredients: ["2 abobrinhas médias picadas", "1 cebola pequena", "Dentes de alho amassados", "Hortelã fresca e manjericão", "Azeite de oliva e sal"],
      instructions: [
        "Cozinhe a abobrinha com cebola e alho em pouca água até amolecer.",
        "Bata no liquidificador com as ervas frescas e azeite.",
        "Sirva quente com sementes por cima."
      ],
      prepTime: "15 min"
    }
  ]
};

const DEFAULT_ALCHEMIST_RECIPE = {
  name: "Alquimia Regeneradora da Floresta",
  desc: "Uma fusão harmônica e revigorante de elementos naturais para nutrir o corpo físico e expandir o corpo sutil.",
  ingredients: ["Ingredientes fornecidos pelo buscador", "Ervas finas (manjericão ou alecrim)", "Fio de azeite extra virgem", "Sal marinho e cúrcuma"],
  instructions: [
    "Respire profundamente e conecte-se com a energia dos ingredientes à sua frente.",
    "Refogue os ingredientes de forma consciente em fogo baixo com azeite e cúrcuma.",
    "Tempere com sal marinho e adicione as ervas finas ao final, com intenção de cura e vitalidade.",
    "Agradeça ao templo físico e consuma com atenção plena."
  ],
  spiritualNote: "Esta alquimia purifica os canais sutis do seu ser, facilitando o fluxo de energia vital (prana) e ancorando a presença divina no momento presente."
};

// In-Memory Daily Cache
interface CacheEntry<T> {
  date: string;
  data: T;
}

const dailyCache = {
  insight: null as CacheEntry<DailyInsight> | null,
  content: null as CacheEntry<DailyContent> | null,
  fermentation: null as CacheEntry<Recipe> | null,
  purification: null as CacheEntry<string[]> | null,
  appCover: null as CacheEntry<string> | null,
  recipeOptions: {} as Record<string, CacheEntry<Recipe[]>>,
};

const SPIRITUAL_SYSTEM_PROMPT = `
Você é o Oráculo da Essência, um mentor espiritual e terapeuta holístico. 
Sua sabedoria baseia-se em:
1. Psicologia Analítica (Sombras e Arquétipos).
2. Filosofia Hermética (Como em cima, assim embaixo).
3. Mindfulness e Presença Radical.
4. Bioenergética e Conexão com o Templo (Corpo).

Instruções CRÍTICAS para geração:
- oracleMessage: Uma mensagem poética e curta de inspiração.
- dailyExercise: Um exercício PRÁTICO e BIOENERGÉTICO de no máximo 3 linhas. Priorize atividades físicas leves e prazerosas (como alongamento consciente, caminhada lenta ou movimentos fluidos) que conectem o buscador com o prazer de habitar o templo.
- REGRAS DE SEGURANÇA: NUNCA sugira queimar incensos, inalar fumaça, usar ervas nocivas ou qualquer prática que envolva substâncias externas perigosas. Fumaça de incenso faz mal à saúde e é proibida.
- FOCO DO EXERCÍCIO: Foque em micro-movimentos, respiração nasal, toques em pontos energéticos, sons vocais ou visualização criativa. 
- EXEMPLO DE ESTILO: "Pressione a ponta da língua no palato e respire pelo nariz sentindo a vibração do ar na base da garganta por três ciclos completos."
- dailyRitual: Um ritual mais estruturado com elements e processos. Inclua sempre um componente de movimento corporal leve e prazeroso.
- shadowPrompt: Uma pergunta profunda para reflexão.

Use linguagem poética, profunda e vibrante.
`;

export async function generateDailyInsight(): Promise<DailyInsight | null> {
  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/daily-insight");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn("Client error generating daily insight:", error);
      return null;
    }
  }

  // Server-side
  const today = getTodayString();
  if (dailyCache.insight && dailyCache.insight.date === today) {
    return dailyCache.insight.data;
  }

  if (!ai) return DEFAULT_DAILY_INSIGHT;
  try {
    const response = await generateContentWithModelFallback((model) => ({
      model,
      contents: `Gere o insight do dia para um buscador espiritual. É fundamental que o 'dailyExercise' seja um exercício prático, seguro e único de bioenergética. ${SPIRITUAL_SYSTEM_PROMPT}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            oracleMessage: { type: Type.STRING },
            dailyExercise: { type: Type.STRING },
            dailyRitual: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                title: { type: Type.STRING },
                elements: { type: Type.ARRAY, items: { type: Type.STRING } },
                process: { type: Type.ARRAY, items: { type: Type.STRING } },
                purpose: { type: Type.STRING }
              },
              required: ["type", "title", "elements", "process", "purpose"]
            },
            shadowPrompt: { type: Type.STRING }
          },
          required: ["oracleMessage", "dailyExercise", "dailyRitual", "shadowPrompt"]
        }
      }
    }));
    const parsed = JSON.parse(response.text || "null");
    if (parsed && parsed.oracleMessage) {
      dailyCache.insight = { date: today, data: parsed };
      return parsed;
    }
  } catch (error) {
    console.warn("[Gemini API] Using high-quality default daily insight fallback.");
  }
  return DEFAULT_DAILY_INSIGHT;
}

export async function analyzeSoulJourney(logs: DailyLog[]): Promise<string> {
  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/analyze-soul-journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.feedback || "O silêncio é o solo onde a verdade floresce.";
    } catch (error) {
      console.warn("Client error in analyzeSoulJourney:", error);
      return "Sua jornada é sagrada.";
    }
  }

  // Server-side
  if (!ai) return "Sua jornada é sagrada.";
  try {
    const context = JSON.stringify(logs.slice(-5));
    const response = await generateContentWithModelFallback((model) => ({
      model,
      contents: `Baseado nos últimos registros de consciência, forneça um insight profundo sobre a evolução do buscador: ${context}. Responda em 20 palavras.`,
    }));
    return response.text || "O silêncio é o solo onde a verdade floresce.";
  } catch (error) { 
    console.warn("[Gemini API] Using default soul journey response.");
    return "Sua jornada é sagrada."; 
  }
}

let isImageGenerationSupported = true;

export async function generateAppCover(): Promise<string | null> {
  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/app-cover");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.cover;
    } catch (error) {
      console.warn("Client error in generateAppCover:", error);
      return null;
    }
  }

  // Server-side
  const today = getTodayString();
  if (dailyCache.appCover && dailyCache.appCover.date === today) {
    return dailyCache.appCover.data;
  }

  const defaultCoverUrl = "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1080&auto=format&fit=crop";

  if (!ai || !isImageGenerationSupported) return defaultCoverUrl;
  try {
    const modelsToTry = ["gemini-3.1-flash-lite-image", "gemini-2.5-flash"];
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: { parts: [{ text: "A mystical, ethereal, high-resolution image of a portal of light, sacred geometry, cosmic nebula, spiritual awakening atmosphere, 4k." }] },
          config: { imageConfig: { aspectRatio: "9:16" } }
        });
        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            const data = `data:image/png;base64,${part.inlineData.data}`;
            dailyCache.appCover = { date: today, data };
            return data;
          }
        }
      } catch (e: any) {
        const errStr = (e?.message || JSON.stringify(e) || "").toLowerCase();
        if (errStr.includes("429") || errStr.includes("quota") || errStr.includes("resource_exhausted")) {
          isImageGenerationSupported = false;
          break;
        }
      }
    }
  } catch (error: any) { 
    console.warn("[Gemini API] Using fallback cover image.");
  }
  return defaultCoverUrl;
}

export async function generateDailyContent(): Promise<DailyContent | null> {
  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/daily-content");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn("Client error generating daily content:", error);
      return null;
    }
  }

  // Server-side
  const today = getTodayString();
  if (dailyCache.content && dailyCache.content.date === today) {
    return dailyCache.content.data;
  }

  if (!ai) return DEFAULT_DAILY_CONTENT;
  try {
    const response = await generateContentWithModelFallback((model) => ({
      model,
      contents: `Gere o conteúdo nutritivo do dia para um buscador espiritual. 
      Regras de Nutrição: SEM GLÚTEN, SEM LATICÍNIOS, SEM AÇÚCAR REFINADO, SEM ÓLEOS VEGETAIS.
      Foque em 3 refeições principais (Desjejum, Almoço, Jantar).
      Inclua uma motivação poética e um desafio de presença.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            motivation: { type: Type.STRING },
            dailyChallenge: { type: Type.STRING },
            menu: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  type: { type: Type.STRING, description: "Desjejum, Almoço ou Jantar" },
                  ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  prepTime: { type: Type.STRING }
                },
                required: ["title", "type", "ingredients", "instructions"]
              }
            }
          },
          required: ["motivation", "dailyChallenge", "menu"]
        }
      }
    }));
    const parsed = JSON.parse(response.text || "null");
    if (parsed && parsed.menu) {
      dailyCache.content = { date: today, data: parsed };
      return parsed;
    }
  } catch (error) {
    console.warn("[Gemini API] Using fallback for daily content.");
  }
  return DEFAULT_DAILY_CONTENT;
}

export async function generateRecipeOptions(mealType: string): Promise<Recipe[]> {
  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/recipe-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealType })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn("Client error in generateRecipeOptions:", error);
      return [];
    }
  }

  // Server-side
  const today = getTodayString();
  if (dailyCache.recipeOptions[mealType] && dailyCache.recipeOptions[mealType].date === today) {
    return dailyCache.recipeOptions[mealType].data;
  }

  if (!ai) return DEFAULT_RECIPE_OPTIONS[mealType] || [];
  try {
    const response = await generateContentWithModelFallback((model) => ({
      model,
      contents: `Gere 5 opções de receitas para ${mealType}. 
      Regras: SEM GLÚTEN, SEM LATICÍNIOS, SEM AÇÚCAR, SEM ÓLEOS VEGETAIS.
      Cada opção deve usar uma base de ingredientes diferente (ex: uma com ovos, outra com frutas, outra com raízes).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              type: { type: Type.STRING },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
              prepTime: { type: Type.STRING }
            },
            required: ["title", "type", "ingredients", "instructions"]
          }
        }
      }
    }));
    const parsed = JSON.parse(response.text || "[]");
    if (Array.isArray(parsed) && parsed.length > 0) {
      dailyCache.recipeOptions[mealType] = { date: today, data: parsed };
      return parsed;
    }
  } catch (error) {
    console.warn(`[Gemini API] Using default recipe options fallback for ${mealType}.`);
  }
  return DEFAULT_RECIPE_OPTIONS[mealType] || [];
}

export async function generateFermentationRecipe(): Promise<Recipe | null> {
  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/fermentation-recipe");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn("Client error in generateFermentationRecipe:", error);
      return null;
    }
  }

  // Server-side
  const today = getTodayString();
  if (dailyCache.fermentation && dailyCache.fermentation.date === today) {
    return dailyCache.fermentation.data;
  }

  if (!ai) return DEFAULT_FERMENTATION_RECIPE;
  try {
    const response = await generateContentWithModelFallback((model) => ({
      model,
      contents: `Gere uma receita de fermentação probiótica (Kefir, Kombucha, Rejuvelac, Chucrute, etc) para saúde intestinal.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            type: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "type", "ingredients", "instructions"]
        }
      }
    }));
    const parsed = JSON.parse(response.text || "null");
    if (parsed && parsed.title) {
      dailyCache.fermentation = { date: today, data: parsed };
      return parsed;
    }
  } catch (error) {
    console.warn("[Gemini API] Using fallback for fermentation recipe.");
  }
  return DEFAULT_FERMENTATION_RECIPE;
}

export async function generatePurificationTips(): Promise<string[]> {
  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/purification-tips");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn("Client error in generatePurificationTips:", error);
      return [];
    }
  }

  // Server-side
  const today = getTodayString();
  if (dailyCache.purification && dailyCache.purification.date === today) {
    return dailyCache.purification.data;
  }

  if (!ai) return DEFAULT_PURIFICATION_TIPS;
  try {
    const response = await generateContentWithModelFallback((model) => ({
      model,
      contents: `Gere 5 dicas curtas e potentes de purificação biológica e desparasitação natural. 
      Inclua obrigatoriamente a dica de mastigar sementes de mamão para liberar princípios ativos.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    }));
    const parsed = JSON.parse(response.text || "[]");
    if (Array.isArray(parsed) && parsed.length > 0) {
      dailyCache.purification = { date: today, data: parsed };
      return parsed;
    }
  } catch (error) {
    console.warn("[Gemini API] Using fallback for purification tips.");
  }
  return DEFAULT_PURIFICATION_TIPS;
}

export function getDynamicAlchemistFallback(ingredientsStr: string): any {
  const rawList = (ingredientsStr || "")
    .split(/[,;\n]+/)
    .map(i => i.trim())
    .filter(i => i.length > 0);
  
  const userIngredients = rawList.length > 0 ? rawList : ["ingredientes selecionados"];
  
  const firstIngredient = userIngredients[0];
  const capitalizedFirst = firstIngredient.charAt(0).toUpperCase() + firstIngredient.slice(1);
  const name = `Alquimia de ${capitalizedFirst} do Templo`;
  
  const desc = `Uma preparação mística, restauradora e personalizada feita com ${userIngredients.slice(0, 3).join(', ')}${userIngredients.length > 3 ? ' e outros elementos de poder' : ''}, consagrada para nutrir seu templo físico, restabelecer o equilíbrio e expandir os canais de energia sutil.`;
  
  const ingredients = [
    ...userIngredients.map(i => i.charAt(0).toUpperCase() + i.slice(1)),
    "Fio de azeite de oliva extra virgem ou óleo de coco prensado a frio",
    "Ervas sagradas do jardim (manjericão, hortelã, sálvia ou alecrim)",
    "Uma pitada de sal marinho integral, cúrcuma ou gengibre ralado"
  ];
  
  const instructions = [
    "Respire profundamente três vezes, acalme a mente e expresse gratidão aos elementos da natureza antes do preparo.",
    `Prepare os ingredientes principais de forma consciente e intencional: ${userIngredients.map(i => i.toLowerCase()).join(', ')}.`,
    "Misture os elementos com delicadeza em fogo baixo com o azeite de oliva ou monte-os frescos à temperatura ambiente, infundindo pensamentos de regeneração e amor.",
    "Adicione uma pitada de sal marinho integral e as ervas aromáticas para selar a alquimia com energia purificadora.",
    "Agradeça ao seu templo biológico e consuma o alimento com presença absoluta e atenção plena a cada sabor."
  ];
  
  const spiritualNote = "Esta alquimia sob medida purifica o fluxo de energia vital (prana) nos canais sutis do seu ser, acendendo o fogo digestivo (Agni) e promovendo a sintonia do corpo com a alma.";
  
  return {
    name,
    desc,
    ingredients,
    instructions,
    spiritualNote
  };
}

export async function generateAlchemistRecipe(ingredients: string): Promise<any | null> {
  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/alchemist-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn("Client error in generateAlchemistRecipe:", error);
      return getDynamicAlchemistFallback(ingredients);
    }
  }

  // Server-side
  if (!ai) return getDynamicAlchemistFallback(ingredients);
  try {
    const response = await generateContentWithModelFallback((model) => ({
      model,
      contents: `Você é o Alquimista de Suporte. O buscador tem os seguintes ingredientes: ${ingredients}. 
      Crie uma receita mística e deliciosa que respeite RIGOROSAMENTE as regras: 
      1. SEM GLÚTEN (nada de trigo, cevada, centeio).
      2. SEM LATICÍNIOS (nada de leite, queijo, manteiga de vaca).
      3. SEM AÇÚCAR REFINADO (use mel, melado ou frutas).
      4. SEM ÓLEOS VEGETAIS (use azeite, óleo de coco ou banha).
      
      A linguagem deve ser poética e encorajadora.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            desc: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            spiritualNote: { type: Type.STRING, description: "Uma nota sobre o benefício espiritual desta alquimia." }
          },
          required: ["name", "desc", "ingredients", "instructions", "spiritualNote"]
        }
      }
    }));
    const parsed = JSON.parse(response.text || "null");
    if (parsed && parsed.name && Array.isArray(parsed.ingredients) && Array.isArray(parsed.instructions)) {
      return parsed;
    }
  } catch (error) {
    console.warn("[Gemini API] Using dynamic alchemist fallback.");
  }
  return getDynamicAlchemistFallback(ingredients);
}

export async function generateSpeech(text: string, instruction?: string): Promise<string | null> {
  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, instruction })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.audio || null;
    } catch (error) {
      console.warn("Client error in generateSpeech:", error);
      return null;
    }
  }

  // Server-side
  if (!ai) return null;

  const defaultInstruction = "Você é uma guia e mentora humana real falando em português do Brasil. Sua voz é naturalmente calorosa, suave, aveludada, fluida e acolhedora. Fale de forma completamente orgânica e expressiva, com entonação viva e ritmo espontâneo de conversa humana, sem qualquer tom sintético ou mecânico.";
  const systemInst = instruction || defaultInstruction;

  const modelsToTry = [
    { name: "gemini-3.1-flash-tts-preview", voice: "Zephyr" },
    { name: "gemini-3.1-flash-tts-preview", voice: "Kore" },
    { name: "gemini-2.5-flash", voice: "Zephyr" },
    { name: "gemini-2.5-flash", voice: "Kore" },
    { name: "gemini-2.5-flash", voice: "Aoede" },
  ];

  for (const m of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: m.name,
        contents: [{ parts: [{ text }] }],
        config: {
          systemInstruction: systemInst,
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: m.voice } } },
        },
      });
      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) return audioData;
    } catch (e: any) {
      const errStr = (e?.message || JSON.stringify(e) || "").toLowerCase();
      if (errStr.includes("429") || errStr.includes("quota") || errStr.includes("resource_exhausted")) {
        console.warn(`[Gemini TTS] Quota/Rate limit on model ${m.name} (${m.voice}), trying next...`);
        continue;
      }
    }
  }

  return null;
}

export async function moderateContent(text: string): Promise<{ safe: boolean; reason?: string }> {
  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/moderate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn("Client error in moderateContent:", error);
      return { safe: true };
    }
  }

  // Server-side
  if (!ai) return { safe: true };
  try {
    const response = await generateContentWithModelFallback((model) => ({
      model,
      contents: `Analise o seguinte texto para discurso de ódio, spam, violência ou conteúdo ofensivo. 
      Responda APENAS um JSON com as chaves "safe" (boolean) e "reason" (string, opcional se não for seguro).
      Texto: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safe: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          },
          required: ["safe"]
        }
      }
    }));
    return JSON.parse(response.text || '{"safe": true}');
  } catch (error) {
    return { safe: true };
  }
}
