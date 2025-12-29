
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { GradingResponse, ImageSize, AspectRatio } from "../types";

export class GeminiService {
  private static getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  static async gradeTest(studentImageB64: string, answerKey: string, keyImageB64?: string | null): Promise<GradingResponse> {
    const ai = this.getAI();
    
    const parts: any[] = [
      { inlineData: { data: studentImageB64.split(',')[1], mimeType: 'image/jpeg' } }
    ];

    let prompt = "";
    if (keyImageB64) {
      parts.push({ inlineData: { data: keyImageB64.split(',')[1], mimeType: 'image/jpeg' } });
      prompt = `
        You are an expert examiner. You are provided with two images:
        1. The first image is the Student's Test Paper.
        2. The second image is the Master Answer Key (a paper with correct answers already marked).
        
        TASK:
        Step 1: Identify all correct answers from the Master Answer Key image.
        Step 2: Detect the student's marked answers from the Student's Test Paper.
        Step 3: Compare the student's answers against the master key.
        Step 4: Calculate the total score out of 10.
        
        Return the results strictly as a JSON object.
      `;
    } else {
      prompt = `
        Grade this multiple-choice test paper based on this answer key text: ${answerKey}. 
        Detect the marked answers on the image (usually filled bubbles or checked boxes). 
        Compare them to the key. Return the results strictly as a JSON object.
      `;
    }

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalQuestions: { type: Type.INTEGER },
            correctCount: { type: Type.INTEGER },
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionNumber: { type: Type.INTEGER },
                  studentAnswer: { type: Type.STRING },
                  correctAnswer: { type: Type.STRING },
                  isCorrect: { type: Type.BOOLEAN }
                },
                required: ["questionNumber", "studentAnswer", "correctAnswer", "isCorrect"]
              }
            }
          },
          required: ["totalQuestions", "correctCount", "score", "results"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  }

  static async editImage(imageB64: string, prompt: string): Promise<string | null> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imageB64.split(',')[1], mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  }

  static async generateHighResImage(prompt: string, size: ImageSize, ratio: AspectRatio): Promise<string | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: ratio,
            imageSize: size
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    } catch (error: any) {
      if (error?.message?.includes("Requested entity was not found")) {
        throw new Error("API_KEY_RESET");
      }
      throw error;
    }
    return null;
  }
}
