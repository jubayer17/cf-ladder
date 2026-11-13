import Link from 'next/link';
import SupportLink from './SupportLink';
export default function Footer() {
  return <footer className="desk-footer mx-auto max-w-7xl px-4 sm:px-8 mt-12 mb-6"><div className="border-t-2 border-foreground pt-5 flex flex-col sm:flex-row justify-between gap-4 text-xs font-mono text-muted-foreground"><p>CF LADDER <span className="mx-2">/</span> Built by Jubayer Ahmed.</p><div className="flex flex-wrap gap-5"><Link href="/unsolved">Unfinished problems ↗</Link><a href="https://github.com/jubayer17/cf-ladder" target="_blank" rel="noopener noreferrer">Source ↗</a><a href="https://github.com/jubayer17" target="_blank" rel="noopener noreferrer">GitHub ↗</a><SupportLink variant="text" /></div></div></footer>;
}
