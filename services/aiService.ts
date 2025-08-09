
import { GoogleGenAI } from "@google/genai";
import { TrendData, AIResult } from '../types';

if (!process.env.API_KEY) {
    // This is a safeguard; the environment is expected to have the API_KEY.
    // In a real app, this might render an error message to the user.
    console.error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
    type: 'ARRAY',
    items: {
      type: 'OBJECT',
      properties: {
        Date: { type: 'STRING' },
        Company: { type: 'STRING' },
        Topic: { type: 'STRING' },
        Technology: { type: 'STRING' },
        Source: { type: 'STRING' },
        stat: { type: 'STRING' },
        ResourceName: { type: 'STRING' },
        reason: { 
            type: 'STRING',
            description: "A brief explanation of why this specific data point is relevant to the user's query."
        },
      },
      required: ["stat", "ResourceName", "reason"]
    },
};


export const findRelevantStats = async (userQuery: string, data: TrendData[]): Promise<AIResult[]> => {
    // To avoid overwhelming the model, let's select a random but significant subset of data if it's too large.
    // Cap at 200 records for the prompt to manage context window size and cost.
    const dataSubset = data.length > 200 ? data.sort(() => 0.5 - Math.random()).slice(0, 200) : data;

    const prompt = `
        You are an expert cybersecurity research assistant.
        Your task is to analyze a user's research request and find the most relevant data points from a provided list of cybersecurity statistics.

        USER'S RESEARCH REQUEST:
        "${userQuery}"

        AVAILABLE DATA (in JSON format):
        ${JSON.stringify(dataSubset)}

        INSTRUCTIONS:
        1. Carefully read the user's request to understand their needs.
        2. Scrutinize the "AVAILABLE DATA" to find entries that directly address the user's request. Focus on matching keywords, topics, and concepts.
        3. For each relevant data point you select, you MUST provide a concise "reason" explaining why it is a good match for the user's request.
        4. Return a JSON array of objects. Each object must represent a single relevant data point and include all its original fields plus your "reason".
        5. If you cannot find any relevant data, return an empty array. Do not invent data.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        if (!jsonText) {
            return [];
        }

        const results = JSON.parse(jsonText);

        // Defensive check: ensure the AI returned a valid array.
        if (!Array.isArray(results)) {
            console.warn("AI did not return a JSON array. Response:", jsonText);
            return [];
        }

        return results as AIResult[];

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get a response from the AI. Please try again.");
    }
};

export const generateSummary = async (data: TrendData[]): Promise<string> => {
    if (data.length === 0) {
        return "No data available to generate a summary.";
    }

    const dataSubset = data.length > 50 ? data.slice(0, 50) : data;

    const prompt = `
        You are a senior Gartner analyst specializing in cybersecurity. Your audience consists of CISOs, CTOs, and other senior technology leaders.
        Analyze the following curated list of cybersecurity statistics and produce a concise, authoritative executive summary in the style of a Gartner research note.

        Your analysis should:
        1.  **Identify the dominant strategic narrative.** What is the overarching story these data points are telling about the current cyber landscape?
        2.  **Highlight key quantitative takeaways.** Use specific percentages or figures to ground your analysis.
        3.  **Synthesize, do not just list.** Weave the data into a cohesive, insightful analysis. Avoid simply restating the stats.
        4.  **Adopt an authoritative, forward-looking tone.** What are the implications of these trends? What should leaders be thinking about next?
        5.  **Structure the output clearly.** Use short paragraphs and bullet points for readability. Start with a strong topic sentence.

        DATA:
        ${JSON.stringify(dataSubset, (key, value) => key === 'reason' ? undefined : value, 2)}

        Produce the executive summary.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error calling Gemini API for summary:", error);
        throw new Error("Failed to generate AI summary. The model may be temporarily unavailable.");
    }
};