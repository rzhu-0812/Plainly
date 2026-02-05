"use server";

import { translateClient, projectId } from "@/lib/gcloud";
import { Summary } from "@/types/types";

export async function translateSummary(
  summary: Summary,
  lang: string
): Promise<Summary | null> {
  try {
    const text = [
      summary.subject,
      summary.translation,
      summary.legalTip,
      ...summary.checklist.map((i) => i.task),
    ];

    const [response] = await translateClient.translateText({
      parent: `projects/${projectId}/locations/global`,
      contents: text,
      mimeType: "text/plain",
      targetLanguageCode: lang,
    });

    const translations =
      response.translations?.map((t) => t.translatedText) || [];

    if (translations.length < 3) return null;

    const subject = translations[0]!;
    const translation = translations[1]!;
    const legalTip = translations[2]!;
    const checkList = summary.checklist.map((item, idx) => ({
      ...item,
      task: translations[idx + 3] || item.task,
    }));

    return {
      ...summary,
      subject: subject,
      translation: translation,
      legalTip: legalTip,
      checklist: checkList,
    };
  } catch (error) {
    console.error("Translation Error:", error);
    return null;
  }
}
