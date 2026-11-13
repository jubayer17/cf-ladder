import Link from 'next/link';
export default function TopicCard({ topic, count }: { topic: string; count: number }) {
  return <Link href={`/topics/${encodeURIComponent(topic)}`} className="desk-topic group block border border-foreground p-5 bg-[var(--card)] hover:bg-[var(--desk-highlight)] transition-colors"><div className="flex justify-between gap-3"><h3 className="font-bold text-lg capitalize tracking-tight">{topic}</h3><span aria-hidden="true" className="text-xl">↗</span></div><p className="mt-5 font-mono text-xs text-muted-foreground">{count.toLocaleString()} PROBLEMS</p></Link>;
}
