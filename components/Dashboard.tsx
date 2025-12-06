import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from 'recharts';
import { DashboardData, Alert } from '../types';
import { AlertCircle, CheckCircle2, TrendingUp, Wallet, PiggyBank, Target, CalendarClock } from 'lucide-react';

interface DashboardProps {
  data: DashboardData | null;
  loading: boolean;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; sub?: string }> = ({ title, value, icon, sub }) => (
  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <div className="text-emerald-400">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    {sub && <div className="text-xs text-slate-500">{sub}</div>}
  </div>
);

const AlertCard: React.FC<{ alert: Alert }> = ({ alert }) => {
  const color = alert.severity === 'high' ? 'text-red-400 border-red-900/50 bg-red-900/20' : 
                alert.severity === 'medium' ? 'text-yellow-400 border-yellow-900/50 bg-yellow-900/20' : 
                'text-blue-400 border-blue-900/50 bg-blue-900/20';
  return (
    <div className={`p-3 rounded-lg border flex items-start gap-3 ${color} mb-2`}>
      <AlertCircle size={18} className="mt-0.5 shrink-0" />
      <p className="text-sm">{alert.message}</p>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ data, loading }) => {
  // State for Loan Allocation Slider
  const [loanAllocationPercent, setLoanAllocationPercent] = useState<number>(0);
  const [calculatedPayoff, setCalculatedPayoff] = useState<string>('');

  // Initialize slider when data loads
  useEffect(() => {
    if (data?.loanStrategy?.hasLoans && data.totalIncome > 0) {
      const suggestedPercent = Math.round((data.loanStrategy.suggestedPayment / data.totalIncome) * 100);
      setLoanAllocationPercent(suggestedPercent > 0 ? suggestedPercent : 10);
      setCalculatedPayoff(data.loanStrategy.estimatedPayoffDate);
    }
  }, [data]);

  // Recalculate payoff when slider moves
  useEffect(() => {
    if (!data?.loanStrategy?.hasLoans || !data?.loanStrategy?.totalPrincipal) return;

    const monthlyAlloc = (data.totalIncome * loanAllocationPercent) / 100;
    
    if (monthlyAlloc <= 0) {
      setCalculatedPayoff("Never");
      return;
    }

    // Simple payoff calculation: Principal / Monthly Payment
    // In a real app, this would include interest rate compounding (amortization)
    const monthsToPayoff = Math.ceil(data.loanStrategy.totalPrincipal / monthlyAlloc);
    
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + monthsToPayoff);
    
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });
    setCalculatedPayoff(formatter.format(futureDate));
    
  }, [loanAllocationPercent, data]);

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 animate-pulse p-8">
        <div className="w-16 h-16 bg-slate-800 rounded-full mb-4"></div>
        <div className="h-4 w-48 bg-slate-800 rounded mb-2"></div>
        <div className="h-3 w-32 bg-slate-800 rounded"></div>
        <p className="mt-8 text-sm">Analyzing financial data with Gemini 2.5 Flash...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
        <Wallet size={48} className="mb-4 opacity-50" />
        <h2 className="text-xl font-semibold text-slate-300 mb-2">Financial Dashboard</h2>
        <p className="max-w-md">Chat with SmartSaving to analyze your finances. Your personalized insights will appear here.</p>
      </div>
    );
  }

  const currentLoanPayment = Math.round((data.totalIncome * loanAllocationPercent) / 100);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Monthly Income" 
          value={`$${data.totalIncome.toLocaleString()}`} 
          icon={<Wallet size={20} />} 
        />
        <StatCard 
          title="Total Expenses" 
          value={`$${data.totalExpenses.toLocaleString()}`} 
          icon={<TrendingUp size={20} className="text-red-400" />} 
          sub={`${((data.totalExpenses / data.totalIncome) * 100).toFixed(1)}% of income`}
        />
        <StatCard 
          title="Recommended Savings" 
          value={`$${data.recommendedSavings.toLocaleString()}`} 
          icon={<PiggyBank size={20} />} 
          sub="Target per month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Allocation Chart */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Budget Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.budgetBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="amount"
                >
                  {data.budgetBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {data.budgetBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || COLORS[idx % COLORS.length] }}></span>
                {item.category}: ${item.amount.toLocaleString()}
              </div>
            ))}
          </div>
        </div>

        {/* Projection Chart */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Savings Projection (6 Months)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.projections}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="balance" stroke="#10b981" fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strategy & Tips Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Loan Strategy */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="text-blue-400" size={24} />
              <h3 className="text-lg font-semibold text-white">
                {data.loanStrategy.hasLoans ? 'Debt Repayment Strategy' : 'Wealth Building'}
              </h3>
            </div>
            {data.loanStrategy.hasLoans && (
              <div className="bg-blue-900/30 px-3 py-1 rounded-full border border-blue-800">
                 <span className="text-xs text-blue-300 font-mono">
                   Est. Principal: ${data.loanStrategy.totalPrincipal?.toLocaleString()}
                 </span>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
             {data.loanStrategy.hasLoans ? (
               <>
                <div className="bg-blue-900/20 border border-blue-900/50 p-3 rounded-lg">
                  <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">Recommended Method</span>
                  <div className="text-lg font-medium text-blue-100">{data.loanStrategy.strategyName}</div>
                </div>
                
                <p className="text-slate-300 text-sm leading-relaxed">{data.loanStrategy.advice}</p>

                {/* Interactive Slider Section */}
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm text-slate-400 font-medium">Monthly Allocation</label>
                    <div className="text-right">
                       <span className="text-lg font-bold text-white block">${currentLoanPayment}</span>
                       <span className="text-xs text-slate-500">{loanAllocationPercent}% of income</span>
                    </div>
                  </div>
                  
                  <input 
                    type="range" 
                    min="1" 
                    max="60" 
                    value={loanAllocationPercent} 
                    onChange={(e) => setLoanAllocationPercent(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                  />

                  <div className="flex items-center justify-between mt-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CalendarClock size={16} />
                      <span className="text-sm">New Payoff Date:</span>
                    </div>
                    <span className="text-emerald-400 font-bold font-mono">
                      {calculatedPayoff}
                    </span>
                  </div>
                </div>
               </>
             ) : (
               <p className="text-slate-300 text-sm">You are debt-free! Focus on maximizing your savings rate and investing for long-term growth. {data.loanStrategy.advice}</p>
             )}
          </div>
        </div>

        {/* Actionable Tips & Alerts */}
        <div className="space-y-4">
          {data.alerts.length > 0 && (
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Alerts</h3>
              {data.alerts.map((alert, idx) => <AlertCard key={idx} alert={alert} />)}
            </div>
          )}

          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
             <h3 className="text-lg font-semibold text-white mb-3">Actionable Tips</h3>
             <ul className="space-y-3">
               {data.actionableTips.map((tip, idx) => (
                 <li key={idx} className="flex gap-3 text-sm text-slate-300">
                   <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                   {tip}
                 </li>
               ))}
             </ul>
          </div>
        </div>

      </div>
    </div>
  );
};