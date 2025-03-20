"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Label = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <motion.label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground/90",
        className
      )}
      whileHover={{ scale: 1.01, color: "rgb(236, 72, 153)" }}
      {...props}
    />
  );
});
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
