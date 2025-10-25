
import { GoogleGenAI, GenerateContentResponse, Chat, Operation } from "@google/genai";
import { AspectRatio, VideoAspectRatio, Style } from '../types';

// This function creates a new GoogleGenAI instance.
// It's called before each API request to ensure the latest API key is used,
// which is crucial for the Veo API key selection flow.
const getAiClient = () => {
    // The API key MUST be obtained exclusively from the environment variable `process.env.API_KEY`.
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateImage = async (
    prompt: string,
    negativePrompt: string,
    style: Style,
    numberOfImages: number,
    aspectRatio: AspectRatio,
): Promise<string[]> => {
    try {
        const ai = getAiClient();
        const fullPrompt = `Style: ${style}. ${prompt}${negativePrompt ? `. Negative prompt: ${negativePrompt}`: ''}`;
        
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: numberOfImages,
                outputMimeType: 'image/png',
                aspectRatio: aspectRatio,
            },
        });

        return response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image. Please check your prompt and try again.");
    }
};

export const generateVideo = async (
    prompt: string,
    imageBase64: string,
    mimeType: string,
    aspectRatio: VideoAspectRatio
): Promise<Operation> => {
    const ai = getAiClient();
    return ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
            imageBytes: imageBase64,
            mimeType: mimeType,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        }
    });
};

export const checkVideoStatus = async (operation: Operation): Promise<Operation> => {
    const ai = getAiClient();
    return ai.operations.getVideosOperation({ operation: operation });
};

export const fetchVideo = async (uri: string): Promise<string> => {
    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    const response = await fetch(`${uri}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};

let chat: Chat | null = null;

export const startChat = () => {
    const ai = getAiClient();
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are a helpful assistant for the TEOMWEXER AI Video Generator. You can help users rewrite, expand, or optimize their prompts. You can also offer real-time style, camera, and lighting suggestions.',
        },
    });
}

export const sendMessageToBot = async (message: string): Promise<string> => {
    if (!chat) {
        startChat();
    }
    try {
        const response: GenerateContentResponse = await chat!.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error sending message to bot:", error);
        // Reset chat on error
        chat = null;
        throw new Error("Failed to get a response from the chatbot.");
    }
};
