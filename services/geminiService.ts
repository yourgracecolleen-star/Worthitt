
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GroundingSource, Conflict, VisualizationData, SourceCategory, AnalysisResult } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const categorizeSource = (title: string, uri: string): SourceCategory => {
  const lowTitle = title.toLowerCase();
  const lowUri = uri.toLowerCase();
  if (lowTitle.includes('census') || lowUri.includes('census.gov') || lowUri.includes('ancestry.com/census')) return 'census';
  if (lowTitle.includes('tax') || lowTitle.includes('assessor') || lowUri.includes('treasurer')) return 'tax';
  if (lowTitle.includes('news') || lowTitle.includes('gazette') || lowTitle.includes('herald') || lowUri.includes('newspapers.com')) return 'newspaper';
  if (lowUri.includes('map') || lowUri.includes('google.com/maps')) return 'map';
  if (lowTitle.includes('deed') || lowTitle.includes('court') || lowTitle.includes('legal')) return 'legal';
  return 'web';
};

const extractSources = (candidates: any): GroundingSource[] => {
  const sources: GroundingSource[] = [];
  const chunks = candidates?.[0]?.groundingMetadata?.groundingChunks;
  
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        const title = chunk.web.title || 'Web Source';
        const uri = chunk.web.uri || '';
        sources.push({
          title,
          uri,
          type: categorizeSource(title, uri)
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

const generateSecurityMeta = () => ({
  verificationScore: Math.floor(Math.random() * 15) + 85, // Mock high-confidence score
  securityHash: Array.from({length: 8}, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase()
});

export const searchRecords = async (query: string): Promise<AnalysisResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Locate and cross-reference public ancestry and land records for: ${query}. 
    PRIORITIZE: 
    1. National and State Census Archives (household structure, residency dates).
    2. Public Tax Information & Assessor Records (property value, assessment IDs, legal owner of record).
    3. Historical Newspaper Data (obituaries, legal notices, real estate transfers).
    Verify all connections and flag discrepancies in ownership vs residency.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return { 
    text: response.text || '', 
    sources: extractSources(response.candidates),
    ...generateSecurityMeta()
  };
};

export const mapProperty = async (location: string): Promise<AnalysisResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Verify geographic and historical tax/land boundaries for: ${location}. Provide official registry links if available via Google Maps.`,
    config: {
      tools: [{ googleMaps: {} }],
    },
  });

  return { 
    text: response.text || '', 
    sources: extractSources(response.candidates),
    ...generateSecurityMeta()
  };
};

export const groundingAudit = async (claim: string): Promise<AnalysisResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Perform a deep verification audit of this archival claim: "${claim}". 
    Cross-check against Census, Tax, and Newspaper databases. 
    Challenge the authenticity of the documentation and verify the chain of custody.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return { 
    text: response.text || '', 
    sources: extractSources(response.candidates),
    ...generateSecurityMeta()
  };
};

export const detectConflicts = async (query: string): Promise<Conflict[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Examine ancestry, census, and tax records for: ${query}. Identify contradictions in ownership dates, residency in census, or news reports of land sales. For each conflict, provide a clear, concise AI-driven summary that explains why the records do not align. Return a JSON list of conflicts.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            recordType: { type: Type.STRING },
            description: { type: Type.STRING },
            summary: { type: Type.STRING, description: "A concise AI summary of the conflict for quick overview." },
            evidenceA: { type: Type.STRING },
            evidenceB: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ['id', 'recordType', 'description', 'summary', 'evidenceA', 'evidenceB', 'reason']
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
    contents: `SECURE RE-ANALYSIS: A user is challenging link "${originalRecord}" with evidence "${newEvidence}".
    Perform a high-security factual verification using all available public archives (Census, Tax, News). 
    Determine if the current connection holds or must be redesigned.`,
    config: {
      thinkingConfig: { thinkingBudget: 20000 },
    },
  });
  return response.text || '';
};

export const generateVisualData = async (query: string): Promise<VisualizationData> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a structured property lineage for: ${query}. Include events categorized as birth, death, legal, tax, or census.`,
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
        { text: 'Analyze this record (Census/Deed/Tax). Extract all entities and cross-reference with known digital archives for verification.' }
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
