
"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex touch-none select-none items-center",
       props.orientation === 'horizontal' ? "w-full h-5" : "h-full w-5",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className={cn(
        "relative grow overflow-hidden rounded-full bg-white/30",
        props.orientation === 'horizontal' ? "h-1.5 w-full" : "w-1.5 h-full flex flex-col-reverse",
    )}>
      <SliderPrimitive.Range className={cn(
          "absolute bg-primary",
           props.orientation === 'horizontal' ? "h-full" : "w-full",
      )} />
    </SliderPrimitive.Track>
     {props.orientation !== 'vertical' && (
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    )}
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }


    