import * as React from "react"

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Badge = React.forwardRef(({ className = "", variant = "default", ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === "default"
          ? "bg-violet-100 text-violet-700 border-violet-200"
          : variant === "secondary"
          ? "bg-white/70 text-violet-700 border-violet-200"
          : "",
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge }; 