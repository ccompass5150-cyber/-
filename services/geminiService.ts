import { GoogleGenAI, Type } from "@google/genai";
import { SurveyData, QuestionType } from "../types";

const parseSurveyText = async (text: string): Promise<SurveyData | null> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse the following text into a structured JSON object for a survey visualization tool.
      
      The text contains:
      1. A total count of questionnaires (infer if possible, otherwise default to 1000).
      2. A list of questions.
      3. For each question, determine if it is Single Choice (单选) or Multi Choice (多选).
      4. For each question, a list of options with their percentage values.
      
      Ensure percentages are numbers (e.g., 87 for 87%).
      
      Input text:
      ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalCount: { type: Type.INTEGER },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  type: { type: Type.STRING, enum: [QuestionType.SINGLE, QuestionType.MULTI] },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        label: { type: Type.STRING },
                        percentage: { type: Type.NUMBER },
                      },
                      required: ["id", "label", "percentage"],
                    },
                  },
                },
                required: ["id", "text", "type", "options"],
              },
            },
          },
          required: ["totalCount", "questions"],
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as SurveyData;
      // Ensure IDs exist if the model lazily skipped them
      data.questions = data.questions.map((q, qIdx) => ({
        ...q,
        id: q.id || `q-${qIdx}`,
        options: q.options.map((o, oIdx) => ({
          ...o,
          id: o.id || `o-${qIdx}-${oIdx}`
        }))
      }));
      return data;
    }
    return null;

  } catch (error) {
    console.error("Error parsing survey text with Gemini:", error);
    throw error;
  }
};

export { parseSurveyText };
