import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
  // In a real production app, this would be proxied or handled securely.
  // Using the provided environment pattern.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateTripVibe = async (location: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key provided for Gemini");
    return `Excited to be heading to ${location}!`;
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, fun, 6-word social media caption for a trip to ${location}. No hashtags.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Flash doesn't need thinking for this
      }
    });

    return response.text?.trim() || `Heading to ${location}!`;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Trip to ${location}`;
  }
};