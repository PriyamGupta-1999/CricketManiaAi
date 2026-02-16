import { GoogleGenerativeAI } from "@google/generative-ai";

const generateCommentary = async (apiKey, event, language) => {
    if (!apiKey) {
        console.warn("No API Key provided for commentary.");
        return "Commentary unavailable (Missing API Key).";
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      You are a lively cricket commentator.
      Generate a short, exciting commentary snippet (max 2 sentences) for the following event:
      - Event Type: ${event.type}
      - Runs Scored: ${event.runs}
      - Batsman: ${event.batsman}
      - Bowler: ${event.bowler}
      - Extra Context: ${event.context || "N/A"}

      Language: ${language}
      Tone: Energetic, professional, slightly dramatic.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error("Error generating commentary:", error);
        return "Technical difficulties with commentary feed.";
    }
};


export async function listAvailableModels(apiKey) {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`ListModels failed: ${res.status} ${text}`);
    }

    const data = await res.json();

    return (data.models || []).map((m) => ({
        name: m.name, // "models/...."
        supportedMethods: m.supportedGenerationMethods || [],
    }));
}
const verifyKey = async (apiKey) => {
    // console.log(listAvailableModels(apiKey))
    let res = await listAvailableModels(apiKey)
    console.log(res)
    if (!apiKey) return false;
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        await model.generateContent("Test");
        return true;
    } catch (error) {
        console.error("API Key verification failed:", error);
        return false;
    }
};




// Simple encryption/decryption for demo purposes
// In a real app, use a more robust solution or backend proxy
const ENCRYPTION_KEY = 'cricket-game-super-secret-key';

const encryptData = (text) => {
    if (!text) return '';
    try {
        const textToChars = text => text.split('').map(c => c.charCodeAt(0));
        const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
        const applySaltToChar = code => textToChars(ENCRYPTION_KEY).reduce((a, b) => a ^ b, code);

        return text.split('')
            .map(textToChars)
            .map(applySaltToChar)
            .map(byteHex)
            .join('');
    } catch (e) {
        console.error("Encryption failed", e);
        return '';
    }
};

const decryptData = (encoded) => {
    if (!encoded) return '';
    try {
        const textToChars = text => text.split('').map(c => c.charCodeAt(0));
        const applySaltToChar = code => textToChars(ENCRYPTION_KEY).reduce((a, b) => a ^ b, code);

        return encoded.match(/.{1,2}/g)
            .map(hex => parseInt(hex, 16))
            .map(applySaltToChar)
            .map(charCode => String.fromCharCode(charCode))
            .join('');
    } catch (e) {
        console.error("Decryption failed", e);
        return '';
    }
};

export { generateCommentary, verifyKey, encryptData, decryptData };
