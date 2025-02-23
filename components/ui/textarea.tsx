"use client";

import React from "react";
import { cn } from "@/lib/utils"; // Optional: utility function for merging class names

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-md border border-gray-300 p-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
