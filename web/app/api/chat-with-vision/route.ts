import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { auth } from '@/auth';
import { kv } from '@vercel/kv';
import { nanoid } from '@/lib/utils';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface ReceivedDataTypes {
  imageUrls: string | undefined
}

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
  // 'data' contains the additional data that you have sent:
  const json = await req.json()
  const { messages, previewToken, data }: { messages: any, previewToken: string | null, data: ReceivedDataTypes } = json

  const userId = (await auth())?.user.id
  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  if (previewToken) {
    openai.apiKey = previewToken
  }

  console.log("Receive API", messages, data)

  const initialMessages = messages.slice(0, -1);
  const currentMessage = messages[messages.length - 1];
  const imageUrls = JSON.parse(data.imageUrls ?? '[]') as string[]
  const imageContent = imageUrls.map(url => {
    return {
      type: 'image_url',
      image_url: url
    }
  })

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    stream: true,
    max_tokens: 1000,
    messages: [
      ...initialMessages,
      {
        ...currentMessage,
        content: [
          { type: 'text', text: currentMessage.content },

          // forward the image information to OpenAI:
          ...imageContent
        ],
      },
    ],
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        imageUrls,
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      }
      await kv.hmset(`chat:${id}`, payload)
      await kv.zadd(`user:chat:${userId}`, {
        score: createdAt,
        member: `chat:${id}`
      })
    }
  });
  // Respond with the stream
  return new StreamingTextResponse(stream);
}