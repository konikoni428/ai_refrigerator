import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@/components/ui/icons'
import { useState } from 'react'

const exampleMessages = [
  {
    heading: '選択した画像からレシピを考える',
    message: `画像に写っている食材から作ることのできるレシピを考えてください。\n調味料などは家にあるものとします。`
  },
  {
    heading: '食材の認識を確認する',
    message: '写真に写っている食材の一覧を教えてください。\n'
  }
]

const images = [
  {
    url: 'https://picsum.photos/id/237/200/300',
    metadata: {
      date: new Date().toString()
    }
  },
  {
    url: 'https://picsum.photos/id/157/200/300',
    metadata: {
      date: new Date().toString()
    }
  },
  {
    url: 'https://picsum.photos/id/45/200/300',
    metadata: {
      date: new Date().toString()
    }
  }
]

interface CheckboxState {
  [key: string]: boolean;
}

export interface EmptyScreenHelpers {
  setInput: React.Dispatch<React.SetStateAction<string>>,
  setImages: (images: string[]) => void
}

export function EmptyScreen({ setInput, setImages }: EmptyScreenHelpers) {
  const [checkboxState, setCheckboxState] = useState<CheckboxState>({})

  const handleChange = (checkboxId: string) => {
    const newState = {
      ...checkboxState,
      [checkboxId]: !checkboxState[checkboxId],
    }
    const trueKeys = Object.keys(newState).filter((key) => newState[key] === true);

    setCheckboxState((prevState) => ({
      ...prevState,
      [checkboxId]: !prevState[checkboxId],
    }));

    setImages(trueKeys);
  };
  
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to AI Chatbot!
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          写真を選択してチャットを開始してください
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
