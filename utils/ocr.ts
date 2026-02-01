'use server'

import { visionClient } from '@/lib/gcloud';

export async function OCR(formData: FormData) {
	try {
		const file = formData.get('file') as File;
		if (!file) throw new Error("No file uploaded");

		const buff = Buffer.from(await file.arrayBuffer());

		const [result] = await visionClient.documentTextDetection({
			image: { content: buff }
		});	

		const text = result.fullTextAnnotation?.text || "No text found";

		return { success: true, text };
	} catch (err: any) {
		console.error("OCR Error:", err);
		return { success: false, error: err.message };
	}
}