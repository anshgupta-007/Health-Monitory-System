"use client";

import React from "react";
import { cn } from "@/lib/utils"; // Optional: utility function for merging class names

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "secondary";
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  className,
  children,
  ...rest
}) => {
  const baseClass = "inline-flex items-center rounded px-2 py-1 text-xs font-medium";
  let variantClass = "";

  switch (variant) {
    case "primary":
      variantClass = "bg-blue-100 text-blue-800";
      break;
    case "secondary":
      variantClass = "bg-gray-100 text-gray-800";
      break;
    default:
      variantClass = "bg-gray-200 text-gray-800";
  }

  return (
    <span className={cn(baseClass, variantClass, className)} {...rest}>
      {children}
    </span>
  );
};
