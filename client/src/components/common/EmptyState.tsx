import React from "react";

interface EmptyStateProps {
  icon?:        React.ReactNode;
  title:        string;
  description?: string;
  action?:      React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-zinc-200 px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 text-zinc-400">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-zinc-800">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-zinc-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
