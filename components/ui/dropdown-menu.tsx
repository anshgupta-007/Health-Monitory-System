"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

// Custom styled components
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Content
    ref={ref}
    className={cn(
      "min-w-[300px] rounded-md border bg-background p-2 shadow-lg",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "data-[side=bottom]:slide-in-from-top-2",
      className
    )}
    {...props}
  />
));

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex flex-col items-start rounded-sm px-4 py-3",
      "text-sm outline-none transition-colors",
      "focus:bg-accent focus:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "border-b last:border-b-0", // Add border between items
      className
    )}
    {...props}
  />
));

// Alert-specific styles
export const alertStyles = {
  base: "w-full p-4 rounded-lg border flex flex-col gap-2",
  variant: {
    default: "bg-background text-foreground",
    destructive: "bg-destructive/10 border-destructive/50 text-destructive",
    success: "bg-success/10 border-success/50 text-success",
  },
  title: "text-sm font-medium",
  description: "text-sm text-muted-foreground",
  time: "text-xs text-muted-foreground mt-1",
  badge: "text-xs font-medium px-2 py-1 rounded-full",
};

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };