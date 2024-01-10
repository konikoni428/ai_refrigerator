import Checkbox from '@/components/ui/checkbox'
import { useState } from 'react'
import React from 'react';

interface CheckboxState {
  [key: string]: boolean;
}

export interface ImageWithCheckboxProps {
  imageUrls?: string[] | undefined
  onChange: (images: string[]) => void
}

export function ImageWithCheckbox({ imageUrls, onChange }: ImageWithCheckboxProps) {
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

    onChange(trueKeys);
  };

  return (
    <>
      {
        imageUrls?.map((url, index) => (
          <div
            key={index}
            className='relative inline-block m-2'
          >
            <Checkbox
              className="absolute top-4 right-4"
              checked={checkboxState[url]}
              onCheckedChange={() => handleChange(url)}
            />
            <img
              className='rounded'
              src={url}  // 画像のソースを指定
              alt="image"
              onClick={() => handleChange(url)}
            />
          </div>
        ))
      }
    </>
  )

}
