'use client';

import { useActionState } from 'react';
import { cn } from '@/lib/utils';
import type { ActionState } from '@/app/(admin)/admin/actions';

type ServerAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

interface Props {
  action: ServerAction;
  fields: Record<string, string | number>;
  children: React.ReactNode;
  className?: string;
  /** If set, asks for confirmation before submitting (e.g. revoke). */
  confirm?: string;
  pendingLabel?: string;
}

/**
 * Generic single-action button backed by a server action. Renders inline
 * error feedback. Server actions can be passed as props to client components.
 */
export function FormButton({ action, fields, children, className, confirm, pendingLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form
      action={formAction}
      onSubmit={confirm ? (e) => { if (!window.confirm(confirm)) e.preventDefault(); } : undefined}
      className="inline-flex flex-col"
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        type="submit"
        disabled={pending}
        className={cn('cursor-pointer disabled:opacity-50', className)}
      >
        {pending ? (pendingLabel ?? '…') : children}
      </button>
      {state?.error && <span className="text-[11px] text-red-600 mt-1 max-w-[14rem]">{state.error}</span>}
    </form>
  );
}
