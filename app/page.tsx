'use client';

import { useState } from 'react';

export default function CashFlowForecast() {
  const [form, setForm] = useState({
    incomeStreams: [{ name: 'Salary', amount: '', frequency: 'monthly' }],
    fixedExpenses: [{ name: 'Rent', amount: '' }],
    variableExpenses: [{ name: 'Groceries', amount: '' }],
    projectionMonths: '6',
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, idx: number, section: string) => {
    const updated = JSON.parse(JSON.stringify(form));
    (updated[section] as Array<{ name: string; amount: string; frequency?: string }>)[idx][e.target.name === 'amount' ? 'amount' : 'name'] = e.target.value;
    if (e.target.name === 'frequency') {
      (updated.incomeStreams as Array<{ name: string; amount: string; frequency: string }>)[idx].frequency = e.target.value;
    }
    setForm(updated);
  };

  const addRow = (section: string) => {
    const newRow = section === 'incomeStreams' ? { name: '', amount: '', frequency: 'monthly' } : { name: '', amount: '' };
    setForm(f => ({ ...f, [section]: [...f[section as keyof typeof f] as typeof f.incomeStreams, newRow] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate forecast');
      setResult(data.result || '');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/20 mb-6">
            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-3">AI Cash Flow Forecast Builder</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Project your monthly cash flow 3–12 months ahead. Identify shortfalls before they happen with AI-driven insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-6 text-cyan-400">Cash Flow Inputs</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-300 font-medium">Income Streams</label>
                  <button type="button" onClick={() => addRow('incomeStreams')} className="text-xs text-cyan-400 hover:text-cyan-300">+ Add</button>
                </div>
                <div className="space-y-2">
                  {form.incomeStreams.map((inc, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input name="name" value={inc.name} onChange={e => handleChange(e, idx, 'incomeStreams')} placeholder="Source"
                        className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:border-cyan-500 focus:outline-none" />
                      <input name="amount" value={inc.amount} onChange={e => handleChange(e, idx, 'incomeStreams')} placeholder="Amount"
                        className="w-24 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:border-cyan-500 focus:outline-none" />
                      <select name="frequency" value={inc.frequency} onChange={e => handleChange(e, idx, 'incomeStreams')}
                        className="bg-gray-900/50 border border-gray-700 rounded-lg px-2 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none">
                        <option value="monthly">/mo</option>
                        <option value="annual">/yr</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-300 font-medium">Fixed Expenses</label>
                  <button type="button" onClick={() => addRow('fixedExpenses')} className="text-xs text-cyan-400 hover:text-cyan-300">+ Add</button>
                </div>
                <div className="space-y-2">
                  {form.fixedExpenses.map((exp, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input name="name" value={exp.name} onChange={e => handleChange(e, idx, 'fixedExpenses')} placeholder="Expense"
                        className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:border-cyan-500 focus:outline-none" />
                      <input name="amount" value={exp.amount} onChange={e => handleChange(e, idx, 'fixedExpenses')} placeholder="Amount"
                        className="w-24 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:border-cyan-500 focus:outline-none" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-300 font-medium">Variable Expenses</label>
                  <button type="button" onClick={() => addRow('variableExpenses')} className="text-xs text-cyan-400 hover:text-cyan-300">+ Add</button>
                </div>
                <div className="space-y-2">
                  {form.variableExpenses.map((exp, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input name="name" value={exp.name} onChange={e => handleChange(e, idx, 'variableExpenses')} placeholder="Expense"
                        className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:border-cyan-500 focus:outline-none" />
                      <input name="amount" value={exp.amount} onChange={e => handleChange(e, idx, 'variableExpenses')} placeholder="Amount"
                        className="w-24 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:border-cyan-500 focus:outline-none" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Projection Period</label>
                <select name="projectionMonths" value={form.projectionMonths} onChange={e => setForm(f => ({ ...f, projectionMonths: e.target.value }))}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none">
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                </select>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading ? (
                  <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Building Forecast...</>
                ) : '📊 Build My Cash Flow Forecast'}
              </button>
            </form>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-6 text-cyan-400">AI Forecast</h2>
            {error && <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-400">{error}</div>}
            {!loading && !result && !error && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <p className="text-lg text-center">Add income/expenses to get your<br/><span className="text-cyan-400 font-medium">cash flow forecast</span></p>
              </div>
            )}
            {loading && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-4">
                <svg className="animate-spin h-10 w-10 text-cyan-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                <p className="text-lg">Projecting your cash flow...</p>
              </div>
            )}
            {!loading && result && (
              <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap leading-relaxed">
                {result}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
