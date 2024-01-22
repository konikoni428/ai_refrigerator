import { kv } from '@vercel/kv'
import { put } from '@vercel/blob';

export const runtime = 'edge'

const generateRandomString = (length: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
    
    return randomString;
};


export async function POST(req: Request) {
  const authorizationHeader = req.headers.get('Authorization')

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return new Response('Bad request. You need to set Authorization header with Bearer token', {
        status: 400,
    })
  }
  const apiKey = authorizationHeader.split('Bearer ')[1]
  
  const userId = await kv.get<string>(`apiKey:${apiKey}`)
  if (!userId) {
    return new Response('Bad api key', {
      status: 401
    })
  }

  const imageData = req.body
  if (!imageData) {
    return new Response('Bad request', {
        status: 400
    })
  }

  const date = new Date()
  const filename = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${generateRandomString(8)}.jpg`;

  const blob = await put(`${userId}/${filename}`, imageData, {
    access: 'public',
  });

  return new Response('Success', {
    status: 200
  })
}
