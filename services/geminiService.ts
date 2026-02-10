
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GroundingSource, Conflict, VisualizationData } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const extractSources = (candidates: any): GroundingSource[] => {
  const sources: GroundingSource[] = [];
  const chunks = candidates?.[0]?.groundingMetadata?.groundingChunks;
  
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || 'Web Source',
          uri: chunk.web.uri || '',
          type: 'web'
        });
      }
      if (chunk.maps) {
        sources.push({
          title: chunk.maps.title || 'Map Location',
          uri: chunk.maps.uri || '',
          type: 'map'
        });
      }
    });
  }
  return sources.filter(s => s.uri);
};

export const searchRecords = async (query: string): Promise<{ text: string; sources: GroundingSource[] }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Locate and verify historical ancestry and land documents for: ${query}. You MUST use Google Search to ground your response in factual, documented records.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return { text: response.text || '', sources: extractSources(response.candidates) };
};

export const mapProperty = async (location: string): Promise<{ text: string; sources: GroundingSource[] }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Verify the geographic existence and history of this land parcel or property: ${location}. Provide links to maps and reviews if relevant.`,
    config: {
      tools: [{ googleMaps: {} }],
    },
  });

  return { text: response.text || '', sources: extractSources(response.candidates) };
};

export const groundingAudit = async (claim: string): Promise<{ text: string; sources: GroundingSource[] }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Perform an advanced grounding audit of this claim: "${claim}". Specifically check for discrepancies against recent news, digital archives, and official land registry data via Google Search.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return { text: response.text || '', sources: extractSources(response.candidates) };
};

export const detectConflicts = async (query: string): Promise<Conflict[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Examine ancestry and land records for: ${query}. Specifically identify inconsistencies in ownership dates, lineage discrepancies, or property markers. Return the results as a list of detailed conflicts.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            recordType: { type: Type.STRING, description: 'ancestry or land' },
            description: { type: Type.STRING },
            evidenceA: { type: Type.STRING },
            evidenceB: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ['id', 'recordType', 'description', 'evidenceA', 'evidenceB', 'reason']
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const submitChallenge = async (originalRecord: string, newEvidence: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Challenge the existing connection: "${originalRecord}" with this new evidence: "${newEvidence}". Re-analyze the factual chain. If the evidence is compelling, explain why the connection is flawed and propose a correction.`,
    config: {
      thinkingConfig: { thinkingBudget: 15000 },
    },
  });
  return response.text || '';
};

export const generateVisualData = async (query: string): Promise<VisualizationData> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a structured timeline and property-linked family tree for: ${query}. Focus on ownership transitions and key life events of owners.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          timeline: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                year: { type: Type.STRING },
                event: { type: Type.STRING },
                actor: { type: Type.STRING },
                type: { type: Type.STRING }
              }
            }
          },
          familyTree: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                propertyLink: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '{"timeline": [], "familyTree": []}');
};

export const scanDocument = async (base64Image: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: 'Extract all factual details from this historical record. Analyze how it fits into a larger genealogical or property chain.' }
      ]
    }
  });
  return response.text || '';
};

export const fastSummarize = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: `Summarize these findings briefly for a quick review: ${text}`,
  });
  return response.text || '';
};
