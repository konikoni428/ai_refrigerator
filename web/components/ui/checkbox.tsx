import React from 'react';
import { cn } from '@/lib/utils'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';

export interface ImageCheckboxProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <CheckboxPrimitive.Root
      {...props}
      ref={ref}
      className={cn(
        'flex items-center justify-center w-6 h-6 mb-4 rounded bg-white hover:bg-violet-300 focus:shadow-[0_0_0_2px_black]',
        className
      )}>
      <CheckboxPrimitive.Indicator
        className={cn(
          'text-violet-900'
        )}>
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = 'CheckBox'
export default Checkbox;