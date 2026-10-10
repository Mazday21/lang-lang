import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#B9EBDD] text-[#1D6B5B] hover:bg-[#9FE2CE] active:bg-[#8BD9C2] shadow-none",
        secondary:
          "bg-[#B7A0F6] text-[#2A2352] hover:bg-[#9C82F0] active:bg-[#A98CF3] shadow-none",
        outline:
          "border border-[#DCD0F5] bg-white text-[#2A2352] hover:bg-[#F2ECFC]",
        ghost:
          "text-[#2A2352] hover:bg-[#EFE9FC]",
        softPeach:
          "bg-[#F9D7DD] text-[#A63A4B] hover:bg-[#F6C8D2]",
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
