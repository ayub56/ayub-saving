import React, { useState, useEffect } from 'react';
import { Chat } from './components/Chat';
import { Dashboard } from './components/Dashboard';
import { Message, ConversationStep, UserData, DashboardData } from './types';
import { generateFinancialPlan } from './services/geminiService';

const INITIAL_MESSAGE: Message = {
  id: 'init-1',
  sender: 'bot',
  text: "Hello! I'm SmartSaving. I can help you create a personalized financial plan. To get started, what should I call you?",
  timestamp: new Date()
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [step, setStep] = useState<ConversationStep>(ConversationStep.NAME);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    monthlyIncome: '',
    monthlyExpenses: '',
    loans: ''
  });
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  const addMessage = (text: string, sender: 'user' | 'bot') => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender,
      text,
      timestamp: new Date()
    }]);
  };

  const handleUserResponse = async (text: string) => {
    // 1. Add User Message
    addMessage(text, 'user');

    // 2. Process based on current step
    let nextStep = step;
    let botResponse = '';

    switch (step) {
      case ConversationStep.NAME:
        setUserData(prev => ({ ...prev, name: text }));
        botResponse = `Nice to meet you, ${text}! To give you the best advice, I need to know your numbers. Roughly how much is your **monthly take-home income**?`;
        nextStep = ConversationStep.INCOME;
        break;

      case ConversationStep.INCOME:
        setUserData(prev => ({ ...prev, monthlyIncome: text }));
        botResponse = "Got it. Now, what are your total **monthly expenses** (rent, food, bills, etc.)? An estimate is fine.";
        nextStep = ConversationStep.EXPENSES;
        break;

      case ConversationStep.EXPENSES:
        setUserData(prev => ({ ...prev, monthlyExpenses: text }));
        botResponse = "Understood. Finally, do you have any **outstanding loans or debts** (credit cards, student loans, car)? If none, just say 'none'.";
        nextStep = ConversationStep.LOANS;
        break;

      case ConversationStep.LOANS:
        setUserData(prev => ({ ...prev, loans: text }));
        botResponse = "Perfect. I'm analyzing your profile and generating your custom dashboard now. Give me a moment...";
        nextStep = ConversationStep.ANALYZING;
        break;
      
      default:
        return;
    }

    setStep(nextStep);
    
    // Add bot response after a short "thinking" delay for realism
    setTimeout(() => {
        addMessage(botResponse, 'bot');
    }, 600);
  };

  // Trigger analysis when reaching ANALYZING step
  useEffect(() => {
    if (step === ConversationStep.ANALYZING) {
      const performAnalysis = async () => {
        setLoading(true);
        try {
          // Pass the collected user data to Gemini
          // We rely on state closure here, but to be safe we use the setter's functional update or dependency
          // However, since we set step in handleUserResponse, userData might not be fully flushed if we used it immediately there.
          // Using useEffect ensures we have the latest render state.
          
          const result = await generateFinancialPlan(userData);
          
          setDashboardData(result.dashboardData);
          addMessage(result.chatResponse, 'bot');
          setStep(ConversationStep.COMPLETED);
        } catch (error) {
          addMessage("I apologize, but I encountered an error analyzing your data. Please check your internet connection and try refreshing.", 'bot');
          console.error(error);
          setStep(ConversationStep.COMPLETED); // Or handle retry
        } finally {
          setLoading(false);
        }
      };

      performAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]); 
  // Dependency on 'step' ensures this runs once when state flips to ANALYZING. 
  // We exclude userData to avoid re-triggering if userData updates spuriously, though it shouldn't at this stage.

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-950 overflow-hidden text-slate-100 font-sans selection:bg-emerald-500/30">
      
      {/* Left Panel: Chat (Mobile: Full width, Desktop: 400px fixed) */}
      <div className={`${step === ConversationStep.COMPLETED ? 'hidden md:flex' : 'flex'} w-full md:w-[400px] lg:w-[450px] shrink-0 h-full`}>
        <Chat 
          messages={messages} 
          step={step} 
          onSendMessage={handleUserResponse}
          loading={loading}
        />
      </div>

      {/* Right Panel: Dashboard (Hidden on mobile until complete/toggle? For now, standard split) */}
      <div className={`flex-1 h-full bg-slate-950 relative overflow-hidden transition-all duration-500 
        ${step !== ConversationStep.COMPLETED && step !== ConversationStep.ANALYZING ? 'opacity-50 blur-sm pointer-events-none md:opacity-100 md:blur-0' : 'opacity-100 blur-0'}`}>
        
        {/* Background Gradients for aesthetic */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <Dashboard data={dashboardData} loading={loading} />
        
        {/* Mobile View Toggle Hint (Visible only on mobile when analysis done) */}
        {step === ConversationStep.COMPLETED && (
             <div className="md:hidden absolute bottom-4 right-4 z-50">
                {/* In a real app, we'd add a toggle button here to switch back to chat on mobile */}
             </div>
        )}
      </div>
    </div>
  );
}
