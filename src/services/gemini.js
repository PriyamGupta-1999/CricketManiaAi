import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

/**
 * Generates energetic cricket commentary using Google's Gemini AI.
 * 
 * @param {string} apiKey - The user's Gemini API key.
 * @param {Object} event - Details of the game event (type, runs, batsman, bowler, context).
 * @param {string} language - The target language for commentary.
 * @returns {Promise<string>} The generated commentary text.
 */
const generateCommentary = async (apiKey, event, language) => {
    if (!apiKey) {
        console.warn("No API Key provided for commentary.");
        return "Commentary unavailable (Missing API Key).";
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
            ],
        });

        const prompt = `
            Context: You are a professional cricket commentator for a high-stakes international match.
            Event Details:
            - Action: ${event.type}
            - Runs: ${event.runs}
            - Batter: ${event.batsman}
            - Bowler: ${event.bowler}
            - Match Situation: ${event.context || "Standard play"}

            Task: Generate one or two sentences of exciting, immersive commentary in ${language}.
            Style: High energy, technical but accessible, slightly dramatic. Focus on the impact of this play.
            Constraint: Do not use placeholders. Speak as if live on air.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Commentary Generation Failure:", error);
        return "The commentary box is experiencing technical difficulties...";
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
/**
 * Verifies the validity of an API key by attempting a simple generation.
 * @param {string} apiKey - The key to verify.
 * @returns {Promise<boolean>} True if valid, false otherwise.
 */
const verifyKey = async (apiKey) => {
    if (!apiKey) return false;
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        await model.generateContent("Verification test");
        return true;
    } catch (error) {
        console.error("API Key verification failed:", error);
        return false;
    }
};




// Simple encryption/decryption for demo purposes
// In a real app, use a more robust solution or backend proxy
const ENCRYPTION_KEY = 'cricket-game-super-secret-key';

/**
 * Encrypts a string using a simple XOR-based salting (Client-side demonstration only).
 * @param {string} text - Plain text to encrypt.
 * @returns {string} Hex-encoded encrypted string.
 */
const encryptData = (text) => {
    if (!text) return '';
    try {
        const textToChars = text => text.split('').map(c => c.charCodeAt(0));
        const byteHex = n => ("0" + Number(n).toString(16)).substring(-2);
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

/**
 * Decrypts a hex-encoded string (Client-side demonstration only).
 * @param {string} encoded - Hex-encoded string to decrypt.
 * @returns {string} Decrypted plain text.
 */
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
