import * as React from 'react'
import Textarea from 'react-textarea-autosize'
import { UseChatHelpers } from 'ai/react'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import Image from 'next/image'
import { ImageSelector, ImageSelectorMethods } from './image-selector'
import { uploadFile } from '@/app/actions'

export interface PromptProps
  extends Pick<UseChatHelpers, 'input' | 'setInput'> {
  onSubmit: (value: string, imageUrls: string[]) => void
  isLoading: boolean
}

export function PromptForm({
  onSubmit,
  input,
  setInput,
  isLoading
}: PromptProps) {
  const [isOpenImageDialog, setIsOpenImageDialog] = React.useState<boolean>(false)
  const [imageUrls, setImageUrls] = React.useState<string[]>([])
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const uploadFileRef = React.useRef<HTMLInputElement>(null)
  const imageSelectRef = React.useRef<ImageSelectorMethods>(null)

  const uploadImage = async (files: FileList | null) => {
    console.log(files)
    if (files) {
      const formdata = new FormData()
      for(let i = 0; i < files.length; i++) {
        formdata.append('files', files[i])
      }
      const res = await uploadFile(formdata)
      if (res.error === null) {
        imageSelectRef.current?.addImages(res.blob)
      }
    }
  }


  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <>
      <form
        onSubmit={async e => {
          e.preventDefault()
          if (!input?.trim()) {
            return
          }
          setInput('')
          setImageUrls([])
          await onSubmit(input, imageUrls)
        }}
        ref={formRef}
      >
        <div className='grid grid-cols-4 place-content-evenly'>
          {
            imageUrls.map((imageUrl, index) => (
              <div
                key={index}
                className='relative inline-block m-2'
              >
                <Image
                  className='rounded object-cover max-h-32 aspect-square'
                  width={100}
                  height={75}
                  src={imageUrl}  // 画像のソースを指定
                  alt="image"
                />
              </div>
            ))
          }
        </div>
        <div className="relative flex flex-col w-full px-8 overflow-hidden max-h-60 grow bg-background sm:rounded-md sm:border sm:px-12">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={e => {
                  e.preventDefault()
                  setIsOpenImageDialog(true)
                }}
                className={cn(
                  buttonVariants({ size: 'sm', variant: 'outline' }),
                  'absolute left-0 top-4 h-8 w-8 rounded-full bg-background p-0 sm:left-4'
                )}
              >
                <IconPlus />
                <span className="sr-only">Select Image</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>New Chat</TooltipContent>
          </Tooltip>
          <Textarea
            ref={inputRef}
            tabIndex={0}
            onKeyDown={onKeyDown}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Send a message."
            spellCheck={false}
            className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
          />
          <div className="absolute right-0 top-4 sm:right-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || input === ''}
                >
                  <IconArrowElbow />
                  <span className="sr-only">Send message</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </form>
      <Dialog open={isOpenImageDialog} onOpenChange={setIsOpenImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>写真を選択してください</DialogTitle>
          </DialogHeader>
          
          <React.Suspense fallback={<div>loading...</div>}>
            <ImageSelector onSetImages={(urls) => setImageUrls(urls)} ref={imageSelectRef} />
          </React.Suspense>


          <DialogFooter className='justify-between'>
            <input
              type="file"
              name="files"
              className='hidden'
              accept='.png,.jpeg,.jpg,.webp,.gif' // limit openai vision
              multiple
              ref={uploadFileRef}
              onChange={(e) => uploadImage(e.target.files)}
            />
            <Button
              onClick={() => uploadFileRef.current?.click()}
            >
              Upload
            </Button>

            <Button
              onClick={() => {
                setIsOpenImageDialog(false)
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
