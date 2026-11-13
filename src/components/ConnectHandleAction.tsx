'use client';
export default function ConnectHandleAction() {
  return <button type="button" className="desk-action" onClick={() => document.querySelector<HTMLInputElement>('header input[aria-label="Codeforces handle"]')?.focus()}>Enter your handle ↑</button>;
}
