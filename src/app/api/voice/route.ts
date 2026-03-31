import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `You are Luna, a warm and knowledgeable AI health companion for women. You specialize in women's health including menstrual cycles, hormonal health, mood, nutrition, and sleep. Keep responses conversational, empathetic, and concise (2-3 paragraphs max since this is a voice conversation). Always be supportive and actionable.`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { transcript, conversationHistory = [] } = body;

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory,
      { role: 'user', content: transcript },
    ];

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ text, usage: response.usage });
  } catch (error: any) {
    console.error('Voice API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
