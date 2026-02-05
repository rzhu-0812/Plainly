"use server";

import { model } from "@/lib/gcloud";
import { Checklist, Summary } from "@/types/types";

export async function summarizeText(text: string): Promise<Summary | null> {
  try {
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const prompt = `
      You are "Plainly AI". Your only job is to extract the "Hard Requirements" of a document. 
      Today's date is ${today}. Use this date to calculate "urgency" based on any deadlines found in the text.
      
      Analyze this text:
      ${text}

      Return a JSON object:
      {
        "subject": "3-5 word title",
        "translation": "2-sentence plain English summary",
        "urgency": "High" | "Medium" | "Low" | "No",
        "deadline": "Critical date or 'None'",
        "checklist": [],
        "legalTip": "One helpful insight"
      }
      
      STRICT INSTRUCTIONS:
      1. IGNORE multi-language boilerplate
      2. IDENTIFY the document type
      3. EXTRACT action items

      CHECKLIST WHITELIST (ONLY include these types of items):
      1. PAYMENTS: (Amount + Date + Primary Method).
      2. SIGNATURES: (Who needs to sign + Where to send).
      3. SUBMISSIONS: (Documents that must be mailed/uploaded).
      4. APPOINTMENTS: (In-person hearings or inspections).

      STRICT BLACKLIST (NEVER include these):
      - NO "Safety Information" (Ignore Life Support, gas leaks, emergency numbers).
      - NO "Comparison Shopping" (Ignore ESCOs, PowerYourWay, or energy tips).
      - NO "Account Management" (Ignore 'Sign up for eBill', 'Download our app', 'Register online').
      - NO "Conditional Help" (Ignore 'If you need help...', 'If you are a senior...').
      
      If a task is just a "recommendation" or "marketing," DISCARD IT. 
      If the only real task is a payment, the checklist should only have ONE item.

      FORMATTING:
        - Each item must be a clean, simple action task.
        - DO NOT include category labels like "PAYMENTS:" or "SIGNATURES:".
        - DO NOT use bullet points or dashes inside the strings.
        - Start every item with a strong verb.
      
      URGENCY CALCULATION:
        - High: Deadline is WITHIN 7 days or has already passed but still within the month.
        - Medium: Deadline is WITHIN 30 days.
        - Low: Deadline is MORE than 30 days away.
        - No: No deadline found, the document is purely INFORMATIONAL, or the deadline has already passed for LONGER than 2 months.
      
      EVEN IF the document seems useless, ALWAYS return a JSON with a SUMMARY.

      If you cannot understand the document, if it is too blurry/noisy, or if it contains no extractable requirements, 
      you MUST return the following JSON with empty values:
      {
        "subject": "Unknown Document",
        "translation": "",
        "urgency": "No",
        "deadline": "None",
        "checklist": [],
        "legalTip": "We couldn't identify specific actions for this document type."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let json = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    json = json
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    if (!json) return null;

    const raw = JSON.parse(json);

    const checklist: Checklist[] = (raw.checklist || []).map(
      (task: string) => ({
        task,
        done: false,
      })
    );

    return {
      ...raw,
      checklist,
    } as Summary;
  } catch (err) {
    console.error("Gemini Analysis Error:", err);
    return null;
  }
}
