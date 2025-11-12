import { GoogleGenAI, Type } from "@google/genai";
import { TradeParams, CalculationResult, AIInsights, Recommendation, CompoundingParams, CompoundingPeriodResult, CompoundingAIInsights, BacktestParams, BacktestResult, BacktestAIInsights } from '../types';

export async function getAIInsights(params: TradeParams, result: CalculationResult, apiKey: string): Promise<AIInsights> {
    if (!apiKey) {
        throw new Error("API key not valid. Please add one in settings.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    Analyze the following trade plan from the perspective of an expert risk manager.
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

export async function getEducationContent(topic: string, apiKey: string): Promise<string> {
    if (!apiKey) {
        throw new Error("API key not valid. Please add one in settings to use the Education Hub.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    As an expert trading educator, explain the concept of "${topic}" for an intermediate trader.
    Your explanation should be clear, concise, and structured. Use Markdown for formatting.
    
    Structure your response as follows:
    1.  **What is it?** - A brief, easy-to-understand definition.
    2.  **Why is it important?** - Explain its significance in trading.
    3.  **Key Principles/Components** - Use a bulleted list to break down the main parts of the concept.
    4.  **Practical Example** - Provide a simple, practical example related to trading (e.g., trading EUR/USD).
    5.  **Common Mistakes to Avoid** - List 2-3 common pitfalls traders encounter with this concept.

    Keep the entire response under 400 words.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.5,
            },
        });
        
        return response.text;

    } catch (error) {
        console.error(`Education content generation failed for topic "${topic}":`, error);
        // Rethrow a more user-friendly error
        throw new Error("Failed to generate educational content. The AI model may be temporarily unavailable or your API key might be invalid.");
    }
}

export async function getCompoundingAIInsights(
    params: CompoundingParams,
    results: CompoundingPeriodResult[],
    apiKey: string
): Promise<CompoundingAIInsights> {
    if (!apiKey) {
        throw new Error("API key not valid. Please add one in settings.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const finalBalance = results.length > 0 ? results[results.length - 1].endCapital : params.initialCapital;

    const prompt = `
    As a trading psychologist and risk management expert, analyze the following compounding plan.
    The user wants to grow their account from ${params.initialCapital} to ${finalBalance.toFixed(2)} over ${params.periods} ${params.periodType.toLowerCase()} periods.

    **Plan Details:**
    - Initial Capital: ${params.initialCapital}
    - Target ${params.periodType} Profit: ${params.targetProfitPercent}%
    - Plan Duration: ${params.periods} ${params.periodType.toLowerCase()} periods
    - Reinvestment Rate: ${params.reinvestmentRate}% of profits

    **Your Task:**
    Provide a structured JSON response to help the user understand the psychological challenges and risks associated with this plan.
    
    1.  "feasibilityScore": An integer from 1 to 10. A score of 10 means the plan is very realistic and sustainable (e.g., 0.5% daily profit). A score of 1 means it's extremely unrealistic and dangerous (e.g., 20% daily profit). Base the score on the target profit percentage and the period type. Daily targets are much harder to hit consistently than monthly ones.
    2.  "summary": A concise, one-paragraph summary. Acknowledge the potential of compounding but gently introduce the psychological realities. For example: "This plan highlights the incredible power of compounding... However, achieving a consistent ${params.targetProfitPercent}% ${params.periodType.toLowerCase()} gain requires immense discipline..."
    3.  "potentialRisks": An array of strings with 2-3 key risks. Examples: "Psychological Pressure: Trying to hit a fixed daily target can lead to forcing bad trades.", "Inconsistent Returns: Real-world trading involves winning and losing streaks, not smooth daily gains.", "Market Volatility: The market may not offer high-quality setups every single day/week."
    4.  "recommendations": An array of strings with 2-3 actionable recommendations. Examples: "Focus on a weekly or monthly target instead of daily to reduce pressure.", "Prioritize following your strategy rules over hitting the daily profit goal.", "Incorporate a 'stop-loss' for your day/week; if you lose a certain amount, take a break."
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            feasibilityScore: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            potentialRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['feasibilityScore', 'summary', 'potentialRisks', 'recommendations'],
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
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as CompoundingAIInsights;

    } catch (error) {
        console.error("Compounding AI insights failed:", error);
        throw new Error("Failed to generate AI analysis for the compounding plan. The model may be busy or your API key is invalid.");
    }
}

export async function getBacktestAIInsights(
    params: BacktestParams,
    result: BacktestResult,
    apiKey: string
): Promise<BacktestAIInsights> {
    if (!apiKey) {
        throw new Error("API key not valid. Please add one in settings.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    As a quantitative trading analyst, provide a detailed analysis of the following automated backtest report for the trading strategy on ${params.symbol}.

    **Strategy Configuration:**
    - Timeframe: ${params.timeframe}
    - Period: ${params.startDate} to ${params.endDate}
    - Initial Balance: $${params.initialBalance}
    - Stop Loss: ${params.stopLossPercent}%
    - Take Profit: ${params.takeProfitPercent}%
    - Rules: ${params.strategyRules}

    **Backtest Performance Metrics:**
    - Net Profit: ${result.netProfitPercent.toFixed(2)}%
    - Win Rate: ${result.winRate.toFixed(1)}%
    - Total Trades: ${result.totalTrades}
    - Max Drawdown: ${result.maxDrawdown.toFixed(2)}%

    **Your Task:**
    Provide a structured JSON response evaluating the strategy's viability.
    1.  "aiStrategyScore": An integer from 1 to 100. The score should reflect profitability, risk (drawdown), and trade frequency. A consistently profitable strategy with low drawdown should score high.
    2.  "marketConditionAnalysis": A short sentence describing the likely market conditions during the backtest period (e.g., "The strategy performed well in a clear uptrending market.").
    3.  "strategyStrengths": A short sentence highlighting the main strength (e.g., "The strategy shows a strong ability to capture profits with a high win rate.").
    4.  "strategyWeaknesses": A short sentence pointing out the main weakness (e.g., "The high drawdown suggests the strategy is vulnerable to volatile market swings.").
    5.  "improvementSuggestions": An array of two strings with specific, actionable suggestions for improvement (e.g., "Consider tightening the stop-loss to reduce drawdown.", "Test a higher take-profit to improve the reward-to-risk ratio.").
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            aiStrategyScore: { type: Type.INTEGER },
            marketConditionAnalysis: { type: Type.STRING },
            strategyStrengths: { type: Type.STRING },
            strategyWeaknesses: { type: Type.STRING },
            improvementSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['aiStrategyScore', 'marketConditionAnalysis', 'strategyStrengths', 'strategyWeaknesses', 'improvementSuggestions'],
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
                temperature: 0.5,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as BacktestAIInsights;

    } catch (error) {
        console.error("Backtest AI insights failed:", error);
        throw new Error("Failed to generate AI analysis for the backtest. The model may be busy or your API key is invalid.");
    }
}