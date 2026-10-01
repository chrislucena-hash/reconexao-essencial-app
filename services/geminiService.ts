import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Capacitor } from "@capacitor/core";
import { DailyLog, Ritual, DailyInsight, DailyContent, Recipe } from "../types";
import { AI_ENABLED } from "../features";

const CONTENT_API_BASE_URL = (import.meta.env?.VITE_CONTENT_API_BASE_URL || "").replace(/\/+$/, "");

async function fetchContentApi(path: string, options?: RequestInit): Promise<Response> {
  if (!AI_ENABLED) throw new Error("AI features are disabled in this release");
  // The native WebView has no Node server at /api. A remote content server must
  // be configured explicitly; otherwise callers use their local fallback.
  if (Capacitor.isNativePlatform() && !CONTENT_API_BASE_URL) {
    throw new Error("Content API is not configured for the native app");
  }
  const { auth } = await import('../firebase');
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in is required for the content API");
  const token = await user.getIdToken();
  const headers = new Headers(options?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${CONTENT_API_BASE_URL}${path}`, { ...options, headers });
}

// Only initialize Gemini API client when running on the server (node/express context)
const serverApiKey = typeof window === "undefined"
  ? process.env.GEMINI_API_KEY || process.env.API_KEY
  : undefined;
const ai = serverApiKey ? new GoogleGenAI({
  apiKey: serverApiKey,
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

// Generated copy must not introduce medical promises or prescriptive diets.
function containsUnsupportedHealthAdvice(value: unknown): boolean {
  const copy = JSON.stringify(value ?? "").toLocaleLowerCase("pt-BR");
  return /desparas|detox|autofagia|regenera|anti.inflamat|inflamação|sensibilidade insul|sem contraind|\bcurar?\b|\bcura\b|\bjejum\b|\bdiagn[oó]stic|\btrate?\b|\btratamento\b|\belimine\b|\bretire\b/.test(copy);
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
const DEFAULT_PURIFICATION_TIPS: string[] = [
  "Faça pausas ao longo do dia e observe como você se sente.",
  "Beba água conforme sua sede e necessidades individuais.",
  "Inclua alimentos variados nas refeições, respeitando suas preferências e orientações profissionais.",
  "Anote dúvidas sobre alimentação ou sintomas para conversar com um profissional de saúde.",
  "Escolha um momento tranquilo para comer com atenção."
];

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
Você é o Oráculo da Essência, um guia de reflexão e bem-estar espiritual.
Sua sabedoria baseia-se em:
1. Psicologia Analítica (Sombras e Arquétipos).
2. Filosofia Hermética (Como em cima, assim embaixo).
3. Mindfulness e Presença Radical.
4. Bioenergética e Conexão com o Templo (Corpo).

Instruções CRÍTICAS para geração:
- oracleMessage: Uma mensagem poética e curta de inspiração.
- dailyExercise: Um exercício PRÁTICO e BIOENERGÉTICO de no máximo 3 linhas. Priorize atividades físicas leves e prazerosas (como alongamento consciente, caminhada lenta ou movimentos fluidos) que conectem o buscador com o prazer de habitar o templo.
- REGRAS DE SEGURANÇA: NUNCA sugira queimar incensos, inalar fumaça, usar ervas nocivas ou qualquer prática que envolva substâncias externas perigosas. Fumaça de incenso faz mal à saúde e é proibida.
- Não faça diagnósticos, atribua causas a sintomas, prescreva dietas ou jejuns, nem prometa prevenção, tratamento ou cura. Recomende avaliação profissional quando houver sintomas.
- FOCO DO EXERCÍCIO: Foque em micro-movimentos, respiração nasal, toques em pontos energéticos, sons vocais ou visualização criativa. 
- EXEMPLO DE ESTILO: "Pressione a ponta da língua no palato e respire pelo nariz sentindo a vibração do ar na base da garganta por três ciclos completos."
- dailyRitual: Um ritual mais estruturado com elements e processos. Inclua sempre um componente de movimento corporal leve e prazeroso.
- shadowPrompt: Uma pergunta profunda para reflexão.

Use linguagem poética, profunda e vibrante.
`;

export async function generateDailyInsight(): Promise<DailyInsight | null> {
  if (typeof window !== "undefined") {
    try {
      const response = await fetchContentApi("/api/daily-insight");
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

  if (!ai) return null;
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
    if (parsed && parsed.oracleMessage && !containsUnsupportedHealthAdvice(parsed)) {
      dailyCache.insight = { date: today, data: parsed };
      return parsed;
    }
  } catch (error) {
    console.warn("[Gemini API] Using high-quality default daily insight fallback.");
  }
  return null;
}

export async function analyzeSoulJourney(logs: DailyLog[]): Promise<string> {
  if (typeof window !== "undefined") {
    try {
      const response = await fetchContentApi("/api/analyze-soul-journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.feedback || "A reflexão automática está indisponível no momento.";
    } catch (error) {
      console.warn("Client error in analyzeSoulJourney:", error);
      return "Seus registros estão salvos. A reflexão automática está indisponível no momento.";
    }
  }

  // Server-side
  if (!ai) return "A reflexão automática está indisponível no momento.";
  try {
    const context = JSON.stringify(logs.slice(-5));
    const response = await generateContentWithModelFallback((model) => ({
      model,
      contents: `Baseado nos últimos registros de consciência, forneça um insight profundo sobre a evolução do buscador: ${context}. Responda em 20 palavras.`,
    }));
    return response.text && !containsUnsupportedHealthAdvice(response.text)
      ? response.text
      : "A reflexão automática está indisponível no momento.";
  } catch (error) { 
    console.warn("[Gemini API] Using default soul journey response.");
    return "A reflexão automática está indisponível no momento.";
  }
}

let isImageGenerationSupported = true;

export async function generateAppCover(): Promise<string | null> {
  if (typeof window !== "undefined") {
    try {
      const response = await fetchContentApi("/api/app-cover");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.cover;
    } catch (error) {
      console.warn("Client error in generateAppCover:", error);
      return "/meditation-cover.jpg";
    }
  }

  // Server-side
  const today = getTodayString();
  if (dailyCache.appCover && dailyCache.appCover.date === today) {
    return dailyCache.appCover.data;
  }

  const defaultCoverUrl = "/meditation-cover.jpg";

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
      const response = await fetchContentApi("/api/daily-content");
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

  if (!ai) return null;
  try {
    const response = await generateContentWithModelFallback((model) => ({
      model,
      contents: `Gere o conteúdo nutritivo do dia para um buscador espiritual. 
      Ofereça exemplos de refeições variadas, sem impor exclusões de grupos alimentares. Não atribua efeitos clínicos aos alimentos.
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
    if (parsed && parsed.menu && !containsUnsupportedHealthAdvice(parsed)) {
      dailyCache.content = { date: today, data: parsed };
      return parsed;
    }
  } catch (error) {
    console.warn("[Gemini API] Using fallback for daily content.");
  }
  return null;
}

export async function generateRecipeOptions(mealType: string): Promise<Recipe[]> {
  if (typeof window !== "undefined") {
    try {
      const response = await fetchContentApi("/api/recipe-options", {
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

  if (!ai) return [];
  try {
    const response = await generateContentWithModelFallback((model) => ({
      model,
      contents: `Gere 5 opções de receitas para ${mealType}. 
      Ofereça receitas variadas sem exclusões alimentares obrigatórias ou promessas de benefícios clínicos.
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
    if (Array.isArray(parsed) && parsed.length > 0 && !containsUnsupportedHealthAdvice(parsed)) {
      dailyCache.recipeOptions[mealType] = { date: today, data: parsed };
      return parsed;
    }
  } catch (error) {
    console.warn(`[Gemini API] Using default recipe options fallback for ${mealType}.`);
  }
  return [];
}

export async function generateFermentationRecipe(): Promise<Recipe | null> {
  if (typeof window !== "undefined") {
    try {
      const response = await fetchContentApi("/api/fermentation-recipe");
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

  if (!ai) return null;
  try {
    const response = await generateContentWithModelFallback((model) => ({
      model,
      contents: `Gere uma receita culinária que use um alimento fermentado comprado pronto para consumo. Não ensine fermentação caseira; mencione seguir as instruções de conservação da embalagem. Não alegue tratamento ou melhora de saúde.`,
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
    if (parsed && parsed.title && !containsUnsupportedHealthAdvice(parsed)) {
      dailyCache.fermentation = { date: today, data: parsed };
      return parsed;
    }
  } catch (error) {
    console.warn("[Gemini API] Using fallback for fermentation recipe.");
  }
  return null;
}

export async function generatePurificationTips(): Promise<string[]> {
  if (typeof window !== "undefined") {
    try {
      const response = await fetchContentApi("/api/purification-tips");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn("Client error in generatePurificationTips:", error);
      return DEFAULT_PURIFICATION_TIPS;
    }
  }

  // Health guidance is curated so generated text cannot introduce prescriptions.
  return DEFAULT_PURIFICATION_TIPS;
}

export async function generateAlchemistRecipe(ingredients: string): Promise<any | null> {
  if (typeof window !== "undefined") {
    try {
      const response = await fetchContentApi("/api/alchemist-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn("Client error in generateAlchemistRecipe:", error);
      return null;
    }
  }

  // Server-side
  if (!ai) return null;
  try {
    const response = await generateContentWithModelFallback((model) => ({
      model,
      contents: `Você é o Alquimista de Suporte. O buscador tem os seguintes ingredientes: ${ingredients}. 
      Crie uma receita culinária com esses ingredientes. Não imponha exclusões alimentares nem prometa efeitos sobre sintomas, doenças ou regeneração. Caso haja alergias ou restrições, a pessoa deve seguir orientação individual de profissional de saúde. A linguagem pode ser poética e encorajadora.`,
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
    if (parsed && parsed.name && Array.isArray(parsed.ingredients) && Array.isArray(parsed.instructions) && !containsUnsupportedHealthAdvice(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn("[Gemini API] Using dynamic alchemist fallback.");
  }
  return null;
}

export async function generateSpeech(text: string, instruction?: string): Promise<string | null> {
  if (typeof window !== "undefined") {
    try {
      const response = await fetchContentApi("/api/speech", {
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
      const response = await fetchContentApi("/api/moderate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (typeof result?.safe !== 'boolean') throw new Error('Invalid moderation response');
      return { safe: result.safe, reason: typeof result.reason === 'string' ? result.reason : undefined };
    } catch (error) {
      console.warn("Client error in moderateContent:", error);
      return { safe: false, reason: "Não foi possível verificar o conteúdo agora. Tente novamente mais tarde." };
    }
  }

  // Server-side
  if (!ai) return { safe: false, reason: "A verificação de conteúdo está indisponível." };
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
    const result = JSON.parse(response.text || 'null');
    if (typeof result?.safe !== 'boolean') throw new Error('Invalid moderation response');
    return { safe: result.safe, reason: typeof result.reason === 'string' ? result.reason : undefined };
  } catch (error) {
    return { safe: false, reason: "A verificação de conteúdo está indisponível." };
  }
}
