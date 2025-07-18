import * as React from "react";

const Alert = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/80 dark:bg-red-900/30 dark:border-red-800 p-4 text-sm ${className}`}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertDescription = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`flex-1 ${className}`} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription }; 