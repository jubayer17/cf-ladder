'use client';
export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return <main className="mx-auto max-w-7xl px-4 sm:px-8 py-16"><p className="desk-kicker">SOMETHING INTERRUPTED THE SESSION</p><h1 className="mt-3 text-3xl font-bold">Let’s try that again.</h1><p className="mt-4 text-muted-foreground">The page could not finish loading. Your Codeforces progress is still available on your profile.</p><button className="desk-action mt-6" onClick={() => retry()}>Reload this view →</button></main>;
}
