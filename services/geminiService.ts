import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserData, GeminiResponse } from "../types";

const processEnvApiKey = process.env.API_KEY;

if (!processEnvApiKey) {
  console.error("API_KEY is missing in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey: processEnvApiKey });

const dashboardSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    dashboardData: {
      type: Type.OBJECT,
      properties: {
        totalIncome: { type: Type.NUMBER, description: "Monthly net income parsed from user input" },
        totalExpenses: { type: Type.NUMBER, description: "Total monthly expenses parsed" },
        recommendedSavings: { type: Type.NUMBER, description: "Recommended monthly savings amount" },
        budgetBreakdown: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              color: { type: Type.STRING, description: "Hex color code for the chart slice" }
            }
          }
        },
        projections: {
          type: Type.ARRAY,
          description: "Projected savings balance for the next 6-12 months",
          items: {
            type: Type.OBJECT,
            properties: {
              month: { type: Type.STRING, description: "Month name e.g. 'Jan'" },
              balance: { type: Type.NUMBER },
              savings: { type: Type.NUMBER }
            }
          }
        },
        loanStrategy: {
          type: Type.OBJECT,
          properties: {
            hasLoans: { type: Type.BOOLEAN },
            strategyName: { type: Type.STRING, description: "e.g., Avalanche, Snowball, or Consolidation" },
            advice: { type: Type.STRING },
            estimatedPayoffDate: { type: Type.STRING },
            totalPrincipal: { type: Type.NUMBER, description: "Total estimated remaining loan principal from user input. Default to 0 if none." },
            suggestedPayment: { type: Type.NUMBER, description: "Suggested monthly payment amount for loans. Default to 0 if none." }
          }
        },
        actionableTips: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        alerts: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
              message: { type: Type.STRING }
            }
          }
        }
      }
    },
    chatResponse: {
      type: Type.STRING,
      description: "A friendly, conversational summary of the financial plan addressing the user by name."
    }
  },
  required: ["dashboardData", "chatResponse"]
};

export const generateFinancialPlan = async (userData: UserData): Promise<GeminiResponse> => {
  const model = "gemini-2.5-flash"; // Using Flash for speed and structured data capability

  const prompt = `
    You are SmartSaving, an expert financial planner. 
    Analyze the following user data to create a comprehensive financial plan.
    
    User Profile:
    - Name: ${userData.name}
    - Reported Monthly Income: ${userData.monthlyIncome}
    - Reported Monthly Expenses: ${userData.monthlyExpenses}
    - Reported Loans/Debts: ${userData.loans}

    Task:
    1. Parse the fuzzy input numbers into strict numbers.
    2. Create a budget allocation (Needs, Wants, Savings - or similar categories).
    3. Generate a savings projection for the next 6 months assuming they follow your plan.
    4. If they have loans, suggest a repayment strategy (Avalanche vs Snowball) and estimate the total principal.
    5. Provide specific actionable tips.
    6. Generate a friendly chat response summarizing the plan.

    Important: Return purely JSON data matching the provided schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: dashboardSchema,
        temperature: 0.2 // Low temperature for consistent numerical analysis
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as GeminiResponse;
  } catch (error) {
    console.error("Error generating financial plan:", error);
    throw error;
  }
};