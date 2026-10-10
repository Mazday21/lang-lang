import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-xl px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#B9EBDD] text-[#1D6B5B]",
        secondary:
          "bg-[#B7A0F6] text-[#2A2352]",
        outline:
          "border border-[#DCD0F5] text-[#2A2352] bg-white",
        muted:
          "bg-[#EFE9FC] text-[#7B6FA6]",
        peach:
          "bg-[#F9D7DD] text-[#A63A4B]",
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
