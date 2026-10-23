import React from "react";

export function Glass({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`glass ${className}`} {...props}>
      {children}
    </div>
  );
}
