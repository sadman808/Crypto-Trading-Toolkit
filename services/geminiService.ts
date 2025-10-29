import { GoogleGenAI, Type } from "@google/genai";
import { TradeParams, CalculationResult, AIInsights, Recommendation, BacktestResult, BacktestAIInsights } from '../types';

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
            // Convert the error to a string to robustly check for overload indicators.
            const errorString = String(error).toLowerCase();
            const isOverloadedError = errorString.includes('503') || errorString.includes('overloaded');

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

export async function getBacktestAIInsights(result: BacktestResult, apiKey: string): Promise<BacktestAIInsights> {
    if (!apiKey) {
        throw new Error("API key not valid. Please add one in settings.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    As a professional crypto trading analyst, analyze the following backtest results for a trading strategy. Provide a concise, insightful, and actionable summary.

    **Backtest Performance Metrics:**
    - Symbol: ${result.params.symbol}
    - Timeframe: ${result.params.timeframe}
    - Period: ${result.params.startDate} to ${result.params.endDate}
    - Strategy: ${result.params.strategyRules}
    - Initial Balance: $${result.params.initialBalance}
    - Final Balance: $${result.finalBalance.toFixed(2)}
    - Net Profit: ${result.netProfit.toFixed(2)}%
    - Total Trades: ${result.totalTrades}
    - Win Rate: ${result.winRate.toFixed(1)}%
    - Max Drawdown: ${result.maxDrawdown.toFixed(2)}%
    - Average Trade Duration: ${result.avgTradeDuration.toFixed(1)} hours

    **Your Task:**
    Based on this data, provide a structured JSON response with the following fields:
    1. "marketConditionAnalysis": (string) Explain what type of market conditions this strategy likely performs best in (e.g., "strong trends", "sideways consolidation", "high volatility"). Base this on the win rate, profit, and trade duration.
    2. "strategyStrengths": (string) A brief sentence on the primary strength of this strategy. For example: "The strategy's main strength is its ability to capture small, consistent gains in range-bound markets."
    3. "strategyWeaknesses": (string) A brief sentence on the primary weakness. For example: "However, it struggles during strong uptrends, often exiting positions too early."
    4. "improvementSuggestions": (array of strings) Provide two concrete, actionable suggestions for improvement. Examples: "Consider adding a 20-period EMA filter to confirm trade direction.", "Increase the stop-loss from ${result.params.stopLossPercent}% to 3% to better withstand volatility.", "Test a higher RSI threshold (e.g., 75) to avoid premature sell signals."
    5. "aiStrategyScore": (integer) An overall score from 1 to 100 for this strategy's performance, considering profitability, risk (drawdown), and consistency (win rate). A highly profitable, low-drawdown strategy should score high.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            marketConditionAnalysis: { type: Type.STRING },
            strategyStrengths: { type: Type.STRING },
            strategyWeaknesses: { type: Type.STRING },
            improvementSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            aiStrategyScore: { type: Type.INTEGER }
        },
        required: ['marketConditionAnalysis', 'strategyStrengths', 'strategyWeaknesses', 'improvementSuggestions', 'aiStrategyScore']
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
                temperature: 0.4,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as BacktestAIInsights;
    } catch (error) {
        console.error("Backtest AI analysis failed:", error);
        throw new Error("Failed to get AI insights for the backtest. Please check your API key and try again.");
    }
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