import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy',
      baseURL: 'https://api.deepseek.com/v1',
    });
  }
  return _client;
}

export async function POST(req: NextRequest) {
  try {
    const { incomeStreams, fixedExpenses, variableExpenses, projectionMonths } = await req.json();

    const incomeStr = (incomeStreams as Array<{ name: string; amount: string; frequency: string }>).map((i) =>
      `${i.name}: $${i.amount}/${i.frequency}`).join('\n');
    const fixedStr = (fixedExpenses as Array<{ name: string; amount: string }>).map((e) => `${e.name}: $${e.amount}`).join('\n');
    const varStr = (variableExpenses as Array<{ name: string; amount: string }>).map((e) => `${e.name}: $${e.amount}`).join('\n');

    const prompt = `You are an AI cash flow forecasting advisor. Analyze the following income and expenses:

Income Streams:
${incomeStr}

Fixed Expenses:
${fixedStr}

Variable Expenses:
${varStr}

Projection period: ${projectionMonths} months

Provide:
1. Monthly net cash flow projection (showing each month)
2. Seasonal pattern analysis (identify months with expected surplus/shortfall)
3. Shortfall alerts: "Month X: short by $Y" with specific warnings
4. Cash buffer optimization recommendations (ideal emergency fund size given their volatility)
5. Specific suggestions to improve cash position (expense reductions, income optimizations)
6. A month-by-month table with projected ending cash balance

Format with clear tables, dollar amounts, and specific actionable advice.`;

    const completion = await getClient().chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
    });

    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (error: unknown) {
    console.error('DeepSeek API error:', error);
    return NextResponse.json({ error: 'Failed to generate cash flow forecast' }, { status: 500 });
  }
}
