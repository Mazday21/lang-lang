import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-xl px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#C7E5C8] text-[#2A472C]",
        secondary:
          "bg-[#E0BBE4] text-[#482C4E]",
        outline:
          "border border-[#E8E2D9] text-[#4A4453] bg-white",
        muted:
          "bg-[#F5EFEB] text-[#8A8493]",
        peach:
          "bg-[#F7D6D0] text-[#6B2E28]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
