import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";

export function Dialog({ open, onOpenChange, children }) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </RadixDialog.Root>
  );
}

export const DialogTrigger = RadixDialog.Trigger;
export const DialogContent = React.forwardRef(({ className, ...props }, ref) => (
  <RadixDialog.Portal>
    <RadixDialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
    <RadixDialog.Content
      ref={ref}
      className={`fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${className || ""}`}
      {...props}
    />
  </RadixDialog.Portal>
));
DialogContent.displayName = "DialogContent";

export const DialogHeader = ({ children, ...props }) => (
  <div className="mb-4" {...props}>{children}</div>
);
export const DialogTitle = ({ children, ...props }) => (
  <h2 className="text-xl font-bold mb-2" {...props}>{children}</h2>
);
export const DialogFooter = ({ children, ...props }) => (
  <div className="flex justify-end gap-2 mt-4" {...props}>{children}</div>
); 