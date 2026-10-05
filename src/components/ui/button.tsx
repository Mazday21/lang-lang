import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#C7E5C8] text-[#2A472C] hover:bg-[#BBE0BD] active:bg-[#AFDBB1] shadow-none",
        secondary:
          "bg-[#E0BBE4] text-[#482C4E] hover:bg-[#D7AEDC] active:bg-[#CCA1D1] shadow-none",
        outline:
          "border border-[#E8E2D9] bg-white text-[#4A4453] hover:bg-[#FAF7F2]",
        ghost:
          "text-[#4A4453] hover:bg-[#F5EFEB]",
        softPeach:
          "bg-[#F7D6D0] text-[#6B2E28] hover:bg-[#F3C8C1]",
      },
      size: {
        default: "h-12 px-5 py-2.5",
        sm: "h-9 rounded-xl px-3 text-xs",
        lg: "h-14 rounded-2xl px-8 text-base font-semibold",
        icon: "h-11 w-11 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
