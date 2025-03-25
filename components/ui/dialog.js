// /components/ui/dialog.jsx
import React, { useEffect, useCallback } from "react";
import { X } from "lucide-react"; // Optional close icon
import clsx from "clsx";

// Main Dialog Component
export function Dialog({ open, onOpenChange, children }) {
  // Close dialog on pressing Escape
  const handleEscape = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    },
    [onOpenChange]
  );

  // Add/remove event listener for Escape key
  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
    } else {
      document.removeEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
      onClick={() => onOpenChange(false)}
    >
      <div
        className={clsx(
          "bg-white rounded-lg shadow-lg w-96 max-w-full p-6 relative transition-transform duration-300",
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// Dialog Header with optional close button
export function DialogHeader({ children, onClose }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="text-lg font-bold">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

// Dialog Title Component
export function DialogTitle({ children }) {
  return <h2 className="text-xl font-semibold mb-2">{children}</h2>;
}

// Dialog Content Wrapper
export function DialogContent({ children }) {
  return <div className="p-4">{children}</div>;
}

// Dialog Footer (Buttons Section)
export function DialogFooter({ children }) {
  return <div className="mt-4 flex justify-end gap-2">{children}</div>;
}

// Dialog Close Button Component
export function DialogCloseButton({ onClose }) {
  return (
    <button
      onClick={onClose}
      className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
    >
      Cancel
    </button>
  );
}
