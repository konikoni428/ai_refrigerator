import { type Message } from 'ai'

import { Separator } from '@/components/ui/separator'
import { ChatMessage } from '@/components/chat-message'

export interface ChatList {
  messages: Message[],
  imageUrls: string[]
}

export function ChatList({ messages, imageUrls }: ChatList) {
  if (!messages.length) {
    return null
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      <div className='grid grid-cols-4 place-content-start'>
        {
          imageUrls.map((imageUrl, index) => (
            <div
              key={index}
              className='relative inline-block m-2'
            >
              <img
                className='rounded'
                src={imageUrl}  // 画像のソースを指定
                alt="image"
              />
            </div>
          ))
        }
      </div>
      {messages.map((message, index) => (
        <div key={index}>
          <ChatMessage message={message} />
          {index < messages.length - 1 && (
            <Separator className="my-4 md:my-8" />
          )}
        </div>
      ))}
    </div>
  )
}
