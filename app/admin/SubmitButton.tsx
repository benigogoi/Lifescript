"use client";

import { useFormStatus } from "react-dom";

/** Submit button that shows a pending label while its form action is in flight. */
export function SubmitButton({
  children,
  pendingLabel,
  className = "admin-action",
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}
