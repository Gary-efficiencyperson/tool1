import { GoogleGenAI, Type } from "@google/genai";
import { SchemaRecommendation } from "../types";

const createClient = () => {
  // Use process.env.API_KEY directly as per guidelines.
  // Assume process.env.API_KEY is available in the environment.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeHeadersWithGemini = async (
  allHeaders: string[]
): Promise<SchemaRecommendation> => {
  try {
    const ai = createClient();
    
    // Remove duplicates for the prompt
    const uniqueHeaders = Array.from(new Set(allHeaders));

    if (uniqueHeaders.length === 0) {
      return { standardHeaders: [], mappings: {} };
    }

    const prompt = `
      You are a data processing expert. I have a list of column headers collected from multiple Excel files that need to be merged.
      
      Many headers represent the same concept but are named differently (e.g., "Email", "E-mail Address", "Mail").
      Some headers are unique.
      
      Your task:
      1. Identify the standard, unified column names. Use the most common or professional naming convention (e.g., prefer "Email" over "Mail").
      2. Map EVERY input header to one of these standard headers.
      
      Input Headers:
      ${JSON.stringify(uniqueHeaders)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            standardHeaders: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "The list of unified, cleaned column names."
            },
            mappingList: {
              type: Type.ARRAY,
              description: "List of mappings from original header to standard header.",
              items: {
                type: Type.OBJECT,
                properties: {
                    original: { type: Type.STRING, description: "The original header name." },
                    standard: { type: Type.STRING, description: "The corresponding standard header name." }
                },
                required: ["original", "standard"]
              }
            }
          },
          required: ["standardHeaders", "mappingList"]
        }
      }
    });

    const rawData = JSON.parse(response.text);
    
    // Transform the list back to the map expected by the application
    const mappings: Record<string, string> = {};
    if (rawData.mappingList && Array.isArray(rawData.mappingList)) {
        rawData.mappingList.forEach((item: {original: string, standard: string}) => {
            mappings[item.original] = item.standard;
        });
    }

    return {
        standardHeaders: rawData.standardHeaders || [],
        mappings
    };

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    // Fallback: Map everything to itself
    const fallbackHeaders = Array.from(new Set(allHeaders));
    const fallbackMappings = fallbackHeaders.reduce((acc, h) => {
      acc[h] = h;
      return acc;
    }, {} as Record<string, string>);
    
    return {
      standardHeaders: fallbackHeaders,
      mappings: fallbackMappings
    };
  }
};