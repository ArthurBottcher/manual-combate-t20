import { Groq, RateLimitError, APIError } from "groq-sdk";
import type { CharacterInfo } from "../types";

const getClient = () => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    console.log("[Groq] API Key loaded:", apiKey ? "YES" : "NO");
    if (!apiKey) {
        throw new Error("API Key for Groq is not configured. Set VITE_GROQ_API_KEY in .env");
    }
    return new Groq({ 
        apiKey,
        maxRetries: 3,
        dangerouslyAllowBrowser: true
    });
}

export const generateSkillSuggestion = async (
    scenarioName: string, 
    characterInfo: CharacterInfo
): Promise<{ name: string, description: string, manaCost?: string, origin?: string }[] | null> => {
    const ai = getClient();
    
    const systemInstruction = `Você é um assistente especialista em Tormenta 20 Edição Jogo do Ano. Sua função é sugerir poderes e habilidades existentes no livro de regras, baseando-se na descrição do personagem. Você NUNCA deve inventar um poder. Forneça o nome exato do poder, sua descrição resumida, o custo em PM (Pontos de Mana) se houver, e a origem do poder (ex: "Guerreiro", "Wynna", "Humano", "Poder Geral"). Se não houver custo em PM, omita o campo manaCost. Se a origem não for específica (como um Poder Geral), pode omitir o campo origin. Sugira até 3 poderes relevantes. Sempre responda em português. Responda APENAS com JSON válido, sem texto adicional.`;
    const { race, characterClass, deity, level, feature } = characterInfo;
    const prompt = `Para o cenário de combate "${scenarioName}", sugira poderes de Tormenta 20 para o seguinte personagem: Raça: ${race}, Classe: ${characterClass}, Divindade: ${deity || 'Nenhuma'}, Nível: ${level}, Característica marcante: ${feature}.`;

    try {
        console.log("[Groq] Making request for skills...");
        const response = await ai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" },
            max_tokens: 1024,
        });

        console.log("[Groq] Response received:", response.model);
        console.log("[Groq] Raw response:", response);
        
        const text = response.choices[0]?.message?.content;
        console.log("[Groq] Text content:", text);
        if (!text) {
            console.warn("[Groq] Empty response, choices:", response.choices);
            return null;
        }
        
        try {
            const parsed = JSON.parse(text);
            console.log("[Groq] Parsed JSON:", parsed);
            
            let powers = null;
            if (Array.isArray(parsed)) {
                powers = parsed;
            } else if (parsed.powers || parsed.poderes) {
                // Handle object with keys like {poder1, poder2, poder3}
                const pwrObj = parsed.powers || parsed.poderes;
                powers = Object.values(pwrObj);
            } else if (parsed.poderesSugeridos) {
                powers = parsed.poderesSugeridos;
            } else {
                powers = [parsed];
            }
            
            // Normalize field names (portuguese to english)
            if (!Array.isArray(powers)) {
                console.warn("[Groq] Powers is not an array:", powers);
                return null;
            }
            
            return (powers as Record<string, unknown>[]).map((p) => ({
                name: String(p.nome || p.name || ''),
                description: String(p.descricao || p.description || ''),
                manaCost: String(p.manaCost || p.manaCost || ''),
                origin: String(p.origem || p.origin || '')
            }));
        } catch (parseError) {
            console.error("[Groq] JSON parse error:", parseError, "Response:", text);
            throw new Error(`Resposta inválida da API: ${text}`);
        }

    } catch (error) {
        console.error("[Groq] Error:", error);
        
        if (error instanceof RateLimitError) {
            throw new Error("Limite de requisições do Groq excedido. Aguarde um momento.");
        }
        if (error instanceof APIError) {
            throw new Error(`Erro da API Groq: ${error.message}`);
        }
        throw error;
    }
};

export const generateScenarioSuggestion = async (
    characterInfo: CharacterInfo
): Promise<{ name: string, description: string }[] | null> => {
    const ai = getClient();

    const { race, characterClass, deity, level, feature } = characterInfo;

    const systemInstruction = `Você é um Mestre de Jogo experiente em Tormenta 20. Sua função é sugerir nomes de cenários de combate ou categorias de ações úteis para um jogador organizar seus poderes, baseando-se na descrição do personagem. Os nomes devem ser curtos e diretos (ex: 'Ataques Corpo-a-Corpo', 'Magias de Suporte', 'Perícias Sociais'). Forneça uma breve descrição (uma frase) para cada cenário sugerido. Sugira de 3 a 5 cenários relevantes. Sempre responda em português. Responda APENAS com JSON válido, sem texto adicional.`;
    
    const prompt = `Sugira cenários de combate para o seguinte personagem de Tormenta 20: Raça: ${race}, Classe: ${characterClass}, Divindade: ${deity || 'Nenhuma'}, Nível: ${level}, Característica marcante: ${feature}.`;

    try {
        console.log("[Groq] Making request for scenarios...");
        const response = await ai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: prompt }
            ],
            temperature: 0.8,
            response_format: { type: "json_object" },
            max_tokens: 512,
        });

        console.log("[Groq] Response received:", response.model);
        
        const text = response.choices[0]?.message?.content;
        if (!text) {
            throw new Error('Sem resposta da API');
        }
        
        try {
            const parsed = JSON.parse(text);
            console.log("[Groq] Parsed JSON:", parsed);
            
            let scenarios = null;
            if (Array.isArray(parsed)) {
                scenarios = parsed;
            } else if (parsed.scenarios || parsed.cenarios) {
                scenarios = parsed.scenarios || parsed.cenarios;
            } else {
                scenarios = [parsed];
            }
            
            // Normalize field names (portuguese to english)
            return scenarios.map((s: Record<string, unknown>) => ({
                name: s.nome || s.name,
                description: s.descricao || s.description
            }));
        } catch (parseError) {
            console.error("[Groq] JSON parse error:", parseError, "Response:", text);
            throw new Error(`Resposta inválida da API: ${text}`);
        }

    } catch (error) {
        console.error("[Groq] Error:", error);
        
        if (error instanceof RateLimitError) {
            throw new Error("Limite de requisições do Groq excedido. Aguarde um momento.");
        }
        if (error instanceof APIError) {
            throw new Error(`Erro da API Groq: ${error.message}`);
        }
        throw error;
    }
};