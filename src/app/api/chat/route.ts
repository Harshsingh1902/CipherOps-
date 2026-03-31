import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `You are Luna, an expert AI health companion for women. You are warm, empathetic, knowledgeable, and supportive. 

Your areas of expertise include:
- Menstrual cycle phases (menstrual, follicular, ovulatory, luteal) and their effects on mood, energy, and cognition
- Hormonal health and how to support it naturally
- Nutrition advice synced with cycle phases
- Sleep hygiene and how hormones affect sleep quality
- Mood management and emotional wellness
- Symptom tracking and pattern recognition
- General women's health, PCOS, endometriosis, PMS/PMDD
- Stress management and mindfulness

Guidelines:
- Always be compassionate, non-judgmental, and encouraging
- Give actionable, specific advice when possible
- Acknowledge that every woman's body is different
- Recommend consulting a doctor for medical diagnoses or serious symptoms
- Keep responses concise but thorough — use bullet points for lists
- Use cycle phase context if provided in the conversation
- Never provide explicit sexual content
- Focus on holistic health: physical, mental, emotional, nutritional

When users share symptoms or concerns, help them understand potential connections to their cycle phase and offer supportive guidance.`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { messages, imageData, imageMediaType } = body;

    // Build message content
    const lastMessage = messages[messages.length - 1];
    let userContent: Anthropic.MessageParam['content'];

    if (imageData && imageMediaType) {
      userContent = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: imageMediaType,
            data: imageData,
          },
        },
        { type: 'text', text: lastMessage.content || 'Please analyze this image and provide health insights.' },
      ];
    } else {
      userContent = lastMessage.content;
    }

    const anthropicMessages: Anthropic.MessageParam[] = [
      ...messages.slice(0, -1).map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userContent },
    ];

    // Stream response
    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: anthropicMessages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
