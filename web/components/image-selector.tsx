import { getFiles } from '@/app/actions';
import { ListBlobResultBlob, PutBlobResult } from '@vercel/blob';
import { ImageWithCheckbox } from './image-with-checkbox';
import { forwardRef, useImperativeHandle, useState } from 'react';


let _images: (ListBlobResultBlob | PutBlobResult)[] | undefined

interface ImageSelectorProps {
  //   setInput: React.Dispatch<React.SetStateAction<string>>,
  onSetImages: (images: string[]) => void
}

export interface ImageSelectorMethods {
  addImages: (imageUrls: PutBlobResult) => void;
}

const ImageSelector = forwardRef<ImageSelectorMethods, ImageSelectorProps>(({ onSetImages }, ref) => {
  const [images, setImages] = useState<(ListBlobResultBlob | PutBlobResult)[] | undefined>(_images)
  useImperativeHandle(ref,
    () => ({
      addImages(imageUrls: PutBlobResult) {
        console.log("Upload Image")
        const newImages = (images ?? []).concat(imageUrls)
        setImages(newImages)
      }
    }
  ));

  if (!images) {
    throw getFiles().then(res => {
      _images = res.blobs
    })
  }
  
  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className='overflow-y-auto h-96 grid grid-cols-4 place-content-start'>
        <ImageWithCheckbox imageUrls={images?.map(img => img.url)} onChange={onSetImages} />
      </div>
    </div>
  )
})
export { ImageSelector }