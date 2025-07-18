import * as React from "react"

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Avatar = React.forwardRef(({ className = "", ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
      className
    )}
    {...props}
  />
))
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef(({ className = "", src, alt = "Avatar", ...props }, ref) => (
  <img
    ref={ref}
    src={src}
    alt={alt}
    className={cn("object-cover w-full h-full", className)}
    {...props}
    onError={e => {
      e.target.style.display = 'none';
    }}
  />
))
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("flex items-center justify-center w-full h-full text-gray-400 text-sm font-medium", className)}
    {...props}
  >
    {children}
  </span>
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback } 