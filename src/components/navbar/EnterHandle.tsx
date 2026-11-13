'use client';
import { useState } from 'react';
interface Props { onSubmitHandle: (handle: string) => Promise<void>; onClear?: () => void; isLoading?: boolean }
export default function EnterHandle({ onSubmitHandle, isLoading = false }: Props) {
  const [input, setInput] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim() && !isLoading) await onSubmitHandle(input.trim());
  }
  return <form onSubmit={submit} className="flex flex-1 min-w-0 items-center gap-2"><input aria-label="Codeforces handle" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={24} value={input} onChange={e => setInput(e.target.value)} disabled={isLoading} placeholder="Codeforces handle" className="px-3 py-2 w-full min-w-0 sm:w-52 border focus:ring-2 focus:ring-blue-500 disabled:opacity-60" /><button type="submit" disabled={isLoading || !input.trim()} className="shrink-0 px-3 py-2 bg-blue-600 text-white text-sm font-medium disabled:opacity-50">{isLoading ? 'Syncing…' : 'Connect'}</button></form>;
}
