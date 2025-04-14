"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);
  //const [hasValue, setHasValue] = React.useState(false);

  // React.useEffect(() => {
  //   //setHasValue(!!props.value);
  // }, [props.value]);

  return (
    <div className="relative">
      <motion.input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background transition-all duration-200",
          "bg-white border-black text-black-300 placeholder:text-black-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        
        ref={ref}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => {
          //setHasValue(!!e.target.value);
          if (props.onChange) props.onChange(e);
        }}
        {...props}
      />
      {isFocused && (
        <motion.span
          className="absolute bottom-0 left-0 h-0.5 bg-pink-400"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
});
Input.displayName = "Input";

export { Input };
