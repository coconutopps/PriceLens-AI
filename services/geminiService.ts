import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const parseBase64 = (base64Data: string) => {
  return base64Data.split(',')[1] || base64Data;
};

export const analyzeImage = async (base64Image: string): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Schema for structured output
  const schema = {
    type: Type.OBJECT,
    properties: {
      productName: {
        type: Type.STRING,
        description: "The name of the product identified in the image. Be concise.",
      },
      price: {
        type: Type.NUMBER,
        description: "The numeric price value found on a tag. If no tag is visible, estimate the market price.",
      },
      currency: {
        type: Type.STRING,
        description: "The currency symbol (e.g., $, €, £). Default to $ if unknown.",
      },
      category: {
        type: Type.STRING,
        description: "A short category for the item (e.g., Electronics, Food, Clothing).",
      },
      confidenceScore: {
        type: Type.NUMBER,
        description: "A number between 0 and 1 indicating how confident you are about the price reading.",
      },
    },
    required: ["productName", "price", "currency", "category", "confidenceScore"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: parseBase64(base64Image),
            },
          },
          {
            text: "Analyze this product image. Identify the product name. Look specifically for a price tag or label. If a price tag is clearly visible, extract that price. If not, provide a realistic estimated market price. Return the data in JSON format.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.2, // Low temperature for more factual extraction
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    const data = JSON.parse(text) as AnalysisResult;
    return data;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback or re-throw depending on app needs
    throw error;
  }
};