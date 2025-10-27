import { GoogleGenAI, Type } from "@google/genai";
import { TradeParams, CalculationResult, AIInsights, Recommendation } from '../types';

export async function getAIInsights(params: TradeParams, result: CalculationResult, apiKey: string): Promise<AIInsights> {
    if (!apiKey) {
        throw new Error("API key not valid. Please add one in settings.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    Analyze the following crypto trade plan from the perspective of an expert risk manager.
    Provide a concise, helpful, and encouraging analysis.

    **Trade Context:**
    - Symbol: ${params.symbol}
    - Direction: ${params.direction}
    - Timeframe: ${params.timeframe}
    - Account Balance: ${params.accountBalance.toFixed(2)} ${params.accountCurrency}
    - Leverage: ${params.leverage}x
    - Risk Method: ${params.riskMethod}

    **Calculated Trade Metrics:**
    - Position Size: ${result.positionSizeAsset.toFixed(5)} ${result.assetName} (${result.positionSizeFiat.toFixed(2)} ${params.accountCurrency})
    - Notional Value (with leverage): ${result.notionalValue.toFixed(2)} ${params.accountCurrency}
    - Maximum Potential Loss: ${result.maxLossFiat.toFixed(2)} ${params.accountCurrency} (${result.maxLossPercent.toFixed(2)}% of account)
    - Reward/Risk Ratio (at target): ${result.rewardRiskRatio.toFixed(2)}:1

    **Your Task:**
    Based on this data, provide a structured JSON response with the following fields:
    1.  "recommendation": Choose one: "Proceed", "Reduce Size", "Skip".
        - "Proceed": If R:R > 1.5, risk is <= 2%, and leverage is reasonable (< 20x).
        - "Reduce Size": If leverage is high (> 20x) or risk is high (2-5%).
        - "Skip": If R:R is < 1 or risk is very high (> 5%).
    2.  "suitabilityScore": An integer from 1 to 10, where 10 is an excellent, well-managed trade plan. The score should reflect the combination of R:R, risk percentage, and leverage. A high R:R and low risk % should yield a high score.
    3.  "summary": A brief, one-paragraph summary of the trade plan's strengths and overall risk profile. Be encouraging but realistic. For example: "Your ${params.symbol} ${params.direction.toLowerCase()} trade plan demonstrates excellent risk management. With a manageable position size of ${result.positionSizeFiat.toFixed(2)} ${params.accountCurrency} and a potential maximum loss of only ${result.maxLossFiat.toFixed(2)} (${result.maxLossPercent.toFixed(2)}% of your account), you're well-positioned to manage risk effectively."
    4.  "warnings": An array of strings identifying potential risks (e.g., "High leverage increases liquidation risk.", "Low R:R may not be worthwhile."). If no major warnings, return an empty array.
    5.  "checklist": An array of four pre-trade best practices objects, each with "text" and a "checked" status. The "text" for each should be: "Stop-loss is correctly placed at ${params.stopLossPrice.toFixed(2)}", "Risk exposure of ${result.maxLossPercent.toFixed(2)}% is confirmed", "Current market conditions support a ${params.direction.toLowerCase()} bias", and "Entry criteria are met before executing the trade". Mark the first item as checked.
    `;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            recommendation: {
                type: Type.STRING,
                enum: Object.values(Recommendation),
                description: 'The AI\'s overall recommendation for the trade.'
            },
            suitabilityScore: {
                type: Type.INTEGER,
                description: 'A score from 1-10 indicating the quality of the risk management.'
            },
            summary: {
                type: Type.STRING,
                description: 'A brief, encouraging summary of the trade plan.'
            },
            warnings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'A list of potential risks or warnings.'
            },
            checklist: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        checked: { type: Type.BOOLEAN }
                    },
                    required: ['text', 'checked']
                },
                description: 'A pre-trade checklist for the user.'
            }
        },
        required: ['recommendation', 'suitabilityScore', 'summary', 'warnings', 'checklist']
    };

    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema,
                    temperature: 0.3,
                },
            });
            
            const jsonText = response.text.trim();
            const parsedJson = JSON.parse(jsonText);
            
            // Basic validation
            if (typeof parsedJson.suitabilityScore !== 'number' || !parsedJson.summary) {
                throw new Error("AI response is missing required fields.");
            }

            return parsedJson as AIInsights;

        } catch (error) {
            const isOverloadedError = error instanceof Error && (error.message.includes('503') || error.message.toLowerCase().includes('overloaded'));

            if (isOverloadedError && attempt < MAX_RETRIES) {
                console.warn(`Attempt ${attempt} failed due to model overload. Retrying in ${500 * attempt}ms...`);
                await new Promise(res => setTimeout(res, 500 * attempt));
                continue;
            }
            
            console.error(`Gemini API call failed after ${attempt} attempts:`, error);
            
            if (isOverloadedError) {
                throw new Error("The AI model is temporarily unavailable due to high demand. Please try again in a few moments.");
            }
            
            // Rethrow other errors (like invalid API key) to be handled by the UI
            throw error;
        }
    }

    // This should not be reached if the loop logic is correct, but provides a fallback.
    throw new Error('An unknown error occurred during AI analysis after multiple retries.');
}

export async function testApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey) {
        return false;
    }
    try {
        const ai = new GoogleGenAI({ apiKey });
        await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'test',
        });
        return true;
    } catch (error) {
        console.error("API Key test failed:", error);
        return false;
    }
}