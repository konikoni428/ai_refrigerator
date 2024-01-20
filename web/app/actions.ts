'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { kv } from '@vercel/kv'
import { put, list } from '@vercel/blob';

import { auth } from '@/auth'
import { type Chat } from '@/lib/types'

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const pipeline = kv.pipeline()
    const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true
    })

    for (const chat of chats) {
      pipeline.hgetall(chat)
    }

    const results = await pipeline.exec()

    return results as Chat[]
  } catch (error) {
    return []
  }
}

export async function getChat(id: string, userId: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || (userId && chat.userId !== userId)) {
    return null
  }

  return chat
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth()
  
  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  const uid = await kv.hget<number>(`chat:${id}`, 'userId')
  if (String(uid) !== session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  await kv.del(`chat:${id}`)
  await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`)

  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1)
  if (!chats.length) {
    return redirect('/')
  }
  const pipeline = kv.pipeline()

  for (const chat of chats) {
    pipeline.del(chat)
    pipeline.zrem(`user:chat:${session.user.id}`, chat)
  }

  await pipeline.exec()

  revalidatePath('/')
  return redirect('/')
}

export async function getSharedChat(id: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || chat.userId !== session.user.id) {
    return {
      error: 'Something went wrong'
    }
  }

  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`
  }

  await kv.hmset(`chat:${chat.id}`, payload)

  return payload
}

export async function uploadFile(form: FormData) {
  const session = await auth()
  const userId = session?.user.id

  if (!userId) {
    return {
      error: 'Unauthorized'
    }
  }

  const file = form.get('files') as File | null
  if (!file) {
    return {
      error: 'Bad Request'
    }
  }

  const pathname = `${userId}/${new Date().getTime()}_${file.name}`
  try {
    const blob = await put(pathname, file, {
      access: 'public',
    })
    console.log("Upload Success", blob.url)
    return {
      blob,
      error: null
    }
  } catch(e: any) {
    console.log("ERROR", e)
    return {
      error: "Register Failed"
    }
  }

}

export async function getFiles() {
  const session = await auth()
  const userId = session?.user.id

  if (!userId) {
    return {
      error: 'Unauthorized'
    }
  }

  const { blobs } = await list({
    prefix: `${userId}/`
  })

  console.log(blobs)
  return {
    error: null,
    blobs: blobs
  }
}

export async function getApiKey() {
  const session = await auth()
  const userId = session?.user.id

  if (!userId) {
    return {
      error: 'Unauthorized'
    }
  }

  try {
    const apiKey = await kv.get<string>(`user:apiKey:${userId}`);
    return {
      apiKey: apiKey
    }
  } catch (error) {
    // Handle errors
    return {
      apiKey: undefined
    }
  }
}

const generateRandomString = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  
  return randomString;
};


export async function registerApiKey() {
  const session = await auth()
  const userId = session?.user.id

  if (!userId) {
    return {
      error: 'Unauthorized'
    }
  }

  const newApiKey = generateRandomString(16)

  try {
    await kv.set(`user:apiKey:${userId}`, newApiKey);
    await kv.set(`apiKey:${newApiKey}`, userId);
    return {
      apiKey: newApiKey
    }
  } catch (error) {
    // Handle errors
    return {
      error: "Register Failed"
    }
  }
}