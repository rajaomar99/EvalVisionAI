type SpinnerSize = "sm" | "md" | "lg";

interface LoadingSpinnerProps {
  size?:      SpinnerSize;
  className?: string;
}

export default function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizes: Record<SpinnerSize, string> = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-zinc-900 border-t-transparent ${sizes[size]}`}
      />
    </div>
  );
}
