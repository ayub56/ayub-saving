export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export interface UserData {
  name: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  loans: string;
}

export interface BudgetCategory {
  category: string;
  amount: number;
  color: string;
}

export interface ProjectionPoint {
  month: string;
  balance: number;
  savings: number;
}

export interface Alert {
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  recommendedSavings: number;
  budgetBreakdown: BudgetCategory[];
  projections: ProjectionPoint[];
  loanStrategy: {
    hasLoans: boolean;
    strategyName: string;
    advice: string;
    estimatedPayoffDate: string;
    totalPrincipal: number;
    suggestedPayment: number;
  };
  actionableTips: string[];
  alerts: Alert[];
}

export interface GeminiResponse {
  dashboardData: DashboardData;
  chatResponse: string;
}

export enum ConversationStep {
  NAME = 0,
  INCOME = 1,
  EXPENSES = 2,
  LOANS = 3,
  ANALYZING = 4,
  COMPLETED = 5
}