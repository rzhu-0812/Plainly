"use server";

import { model } from "@/lib/gcloud";
import { Summary } from "@/types/types";

export async function summarizeText(text: string): Promise<Summary | null> {
  try {
    const prompt = `
      You are "Plainly AI", a legal assistant that simplifies complex documents.
      Analyze the following text extracted from a legal document. 
      
      Return a JSON object that matches this EXACT structure:
      {
        "subject": "3-5 word title of the document",
        "translation": "2-sentence explanation in extremely simple plain English",
        "urgency": "High" | "Medium" | "Low" | "No",
        "deadline": "The most critical date found or 'None'",
        "checklist": [], 
        "legalTip": "One helpful tip for a small business or family"
      }

      IMPORTANT for "checklist": 
      This must be a dynamic array of strings.
      Extract EVERY specific task, requirement, or action mentioned in the document. 
      If a lease has 8 requirements, list 8 steps. If a notice has 2, list 2.
      Make sure each task is easy to understand.

      Document Text:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const json = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!json) return null;

    return JSON.parse(json) as Summary;
  } catch (err) {
    console.error("Gemini Analysis Error:", err);
    return null;
  }
}
