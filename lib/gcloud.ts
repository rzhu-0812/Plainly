import { ImageAnnotatorClient } from "@google-cloud/vision";
import { VertexAI } from "@google-cloud/vertexai";
import { TranslationServiceClient } from "@google-cloud/translate";

const creds = JSON.parse(process.env.GCLOUD_API_KEY || "{}");

const vision = global as unknown as { visionClient: ImageAnnotatorClient };

export const visionClient =
  vision.visionClient ||
  new ImageAnnotatorClient({
    credentials: creds,
  });

const vertex = new VertexAI({
  project: creds.project_id,
  location: "us-central1",
  googleAuthOptions: {
    credentials: {
      client_email: creds.client_email,
      private_key: creds.private_key?.replace(/\\n/g, "\n"),
    },
  },
});

export const model = vertex.getGenerativeModel({
  model: "gemini-2.0-flash-001",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

export const translateClient = new TranslationServiceClient({
  credentials: {
    client_email: creds.client_email,
    private_key: creds.private_key?.replace(/\\n/g, "\n"),
  },
});

export const projectId = creds.project_id;
