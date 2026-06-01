
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DailyLog, Ritual, DailyInsight, DailyContent, Recipe } from "../types";

function getAi(): GoogleGenAI {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY nao configurada.');
  }
  return new GoogleGenAI({ apiKey });
}

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
- dailyRitual: Um ritual mais estruturado com elementos e processos. Inclua sempre um componente de movimento corporal leve e prazeroso.
- shadowPrompt: Uma pergunta profunda para reflexão.

Use linguagem poética, profunda e vibrante.
`;

export async function generateDailyInsight(): Promise<DailyInsight | null> {
  try {
    const response = await getAi().models.generateContent({
      model: "gemini-3-flash-preview",
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
    });
    return JSON.parse(response.text || "null");
  } catch (error) {
    console.error("Error generating spiritual content:", error);
    return null;
  }
}

export async function analyzeSoulJourney(logs: DailyLog[]): Promise<string> {
  try {
    const context = JSON.stringify(logs.slice(-5));
    const response = await getAi().models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Baseado nos últimos registros de consciência, forneça um insight profundo sobre a evolução do buscador: ${context}. Responda em 20 palavras.`,
    });
    return response.text || "O silêncio é o solo onde a verdade floresce.";
  } catch (error) { return "Sua jornada é sagrada."; }
}

export async function generateAppCover(): Promise<string | null> {
  try {
    const response = await getAi().models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: "A mystical, ethereal, high-resolution image of a portal of light, sacred geometry, cosmic nebula, spiritual awakening atmosphere, 4k." }] },
      config: { imageConfig: { aspectRatio: "9:16" } }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) { return null; }
}

export async function generateDailyContent(): Promise<DailyContent | null> {
  try {
    const response = await getAi().models.generateContent({
      model: "gemini-3-flash-preview",
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
    });
    return JSON.parse(response.text || "null");
  } catch (error) {
    console.error("Error generating daily content:", error);
    return null;
  }
}

export async function generateRecipeOptions(mealType: string): Promise<Recipe[]> {
  try {
    const response = await getAi().models.generateContent({
      model: "gemini-3-flash-preview",
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
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
}

export async function generateFermentationRecipe(): Promise<Recipe | null> {
  try {
    const response = await getAi().models.generateContent({
      model: "gemini-3-flash-preview",
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
    });
    return JSON.parse(response.text || "null");
  } catch (error) {
    return null;
  }
}

export async function generatePurificationTips(): Promise<string[]> {
  try {
    const response = await getAi().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere 5 dicas curtas e potentes de purificação biológica e desparasitação natural. 
      Inclua obrigatoriamente a dica de mastigar sementes de mamão para liberar princípios ativos.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
}

export async function generateAlchemistRecipe(ingredients: string): Promise<any | null> {
  try {
    const response = await getAi().models.generateContent({
      model: "gemini-3-flash-preview",
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
    });
    return JSON.parse(response.text || "null");
  } catch (error) {
    console.error("Alchemist error:", error);
    return null;
  }
}

export async function generateSpeech(text: string, instruction?: string): Promise<string | null> {
  try {
    const defaultInstruction = "Diga com uma voz extremamente doce, suave e acolhedora";
    const finalInstruction = instruction || defaultInstruction;
    const response = await getAi().models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `${finalInstruction}: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) { return null; }
}

export async function moderateContent(text: string): Promise<{ safe: boolean; reason?: string }> {
  try {
    const response = await getAi().models.generateContent({
      model: "gemini-3-flash-preview",
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
    });
    return JSON.parse(response.text || '{"safe": true}');
  } catch (error) {
    console.error("Moderation error:", error);
    return { safe: false, reason: 'Moderacao indisponivel no momento.' };
  }
}
