import { ImageAnnotatorClient } from '@google-cloud/vision';

const vision = global as unknown as { visionClient: ImageAnnotatorClient }

export const visionClient = 
	vision.visionClient ||
	new ImageAnnotatorClient({
		credentials: JSON.parse(process.env.gcv || '{}')
	});

if (process.env.NODE_ENV !== 'production') vision.visionClient = visionClient;