"use client";

import { cn } from "@/lib/utils";
import React from "react";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  return (
    <div className={cn("relative p-[4px] group", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0 rounded-[inherit] opacity-60 group-hover:opacity-100 transition duration-500",
          animate && "animate-gradient"
        )}
        style={{
          background: `linear-gradient(90deg, #60a5fa, #a78bfa, #ec4899, #60a5fa)`,
          backgroundSize: "400% 400%",
        }}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};

