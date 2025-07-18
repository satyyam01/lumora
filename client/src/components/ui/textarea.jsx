import * as React from "react";

const Textarea = React.forwardRef(({ className = "", ...props }, ref) => (
  <textarea
    ref={ref}
    className={`block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 dark:focus:border-violet-500 transition-all duration-200 ${className}`}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea }; 