
import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { CharacterInfo } from "../types";

let ai: GoogleGenAI | null = null;

// Lazily initialize the AI instance to prevent app crash on load if API key is missing.
const getAi = (): GoogleGenAI => {
    if (!ai) {
        if (!process.env.API_KEY) {
            // This error will be caught by the calling component's try/catch block.
            throw new Error("API Key for Gemini is not configured.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}

export const generateSkillSuggestion = async (scenarioName: string, characterInfo: CharacterInfo): Promise<{ name: string, description: string, manaCost?: string, origin?: string }[] | null> => {
  const ai = getAi();
  
  const systemInstruction = `Você é um assistente especialista em Tormenta 20 Edição Jogo do Ano. Sua função é sugerir poderes e habilidades existentes no livro de regras, baseando-se na descrição do personagem. Você NUNCA deve inventar um poder. Forneça o nome exato do poder, sua descrição resumida, o custo em PM (Pontos de Mana) se houver, e a origem do poder (ex: "Guerreiro", "Wynna", "Humano", "Poder Geral"). Se não houver custo em PM, omita o campo manaCost. Se a origem não for específica (como um Poder Geral), pode omitir o campo origin. Sugira até 3 poderes relevantes. Sempre responda em português.`;
  const { race, characterClass, deity, level, feature } = characterInfo;
  const prompt = `Para o cenário de combate "${scenarioName}", sugira poderes de Tormenta 20 para o seguinte personagem: Raça: ${race}, Classe: ${characterClass}, Divindade: ${deity || 'Nenhuma'}, Nível: ${level}, Característica marcante: ${feature}.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "O nome exato do poder de Tormenta 20."
              },
              description: {
                type: Type.STRING,
                description: "A descrição resumida do poder, conforme o livro de regras."
              },
              manaCost: {
                type: Type.STRING,
                description: "O custo em Pontos de Mana (PM) do poder. Ex: '2 PM', 'Variável', etc. Opcional.",
                nullable: true
              },
              origin: {
                type: Type.STRING,
                description: "A origem do poder, como o nome da classe, raça ou divindade. Ex: 'Guerreiro', 'Elfo', 'Wynna'. Opcional.",
                nullable: true
              }
            },
            required: ["name", "description"]
          }
        },
        temperature: 0.7,
        topP: 0.95,
      }
    });

    const text = response.text;
    const parsed = JSON.parse(text);
    return parsed as { name: string, description: string, manaCost?: string, origin?: string }[];

  } catch (error) {
    console.error("Error generating skill suggestion:", error);
    return null;
  }
};

export const generateScenarioSuggestion = async (characterInfo: CharacterInfo): Promise<{ name: string, description: string }[] | null> => {
  const ai = getAi();

  const { race, characterClass, deity, level, feature } = characterInfo;

  const systemInstruction = `Você é um Mestre de Jogo experiente em Tormenta 20. Sua função é sugerir nomes de cenários de combate ou categorias de ações úteis para um jogador organizar seus poderes, com base na descrição do personagem. Os nomes devem ser curtos e diretos (ex: 'Ataques Corpo-a-Corpo', 'Magias de Suporte', 'Perícias Sociais'). Forneça uma breve descrição (uma frase) para cada cenário sugerido. Sugira de 3 a 5 cenários relevantes. Sempre responda em português.`;
  
  const prompt = `Sugira cenários de combate para o seguinte personagem de Tormenta 20: Raça: ${race}, Classe: ${characterClass}, Divindade: ${deity || 'Nenhuma'}, Nível: ${level}, Característica marcante: ${feature}.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "O nome curto e direto para o cenário (ex: 'Ações de Ataque')."
              },
              description: {
                type: Type.STRING,
                description: "Uma frase descritiva sobre o propósito do cenário."
              }
            },
            required: ["name", "description"]
          }
        },
        temperature: 0.8,
        topP: 0.95,
      }
    });

    const text = response.text;
    const parsed = JSON.parse(text);
    return parsed as { name: string, description: string }[];

  } catch (error) {
    console.error("Error generating scenario suggestion:", error);
    return null;
  }
};
