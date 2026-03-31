import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `You are Luna, an AI health companion for women. When analyzing images:
- For nutrition labels: break down key nutrients, highlight what's good/bad for hormonal health, and give a recommendation
- For health reports or lab results: explain what the values mean in plain language and note any values that should be discussed with a doctor
- For food photos: estimate nutritional content, note if it's cycle-phase friendly, and suggest improvements
- For symptom photos (skin, etc.): describe what you observe and recommend whether to see a doctor
- Always be thorough but accessible, and remind users to consult healthcare providers for medical decisions.`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { imageData, mediaType, prompt } = body;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageData },
            },
            {
              type: 'text',
              text: prompt || 'Please analyze this image and provide relevant health insights for a woman tracking her wellness.',
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return NextResponse.json({ analysis: text });
  } catch (error: any) {
    console.error('Analyze API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
