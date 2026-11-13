import Link from 'next/link';
export default function TopicCard({ topic, count, solved = 0, attempted = 0, connected = false }: { topic: string; count: number; solved?: number; attempted?: number; connected?: boolean }) {
  const percent = count ? Math.round(solved/count*100) : 0;
  return <Link href={`/topics/${encodeURIComponent(topic)}`} data-complete={connected && solved === count && count > 0} className="desk-topic group block p-5"><div className="flex justify-between gap-3"><h3 className="font-bold text-lg capitalize tracking-tight">{topic}</h3><span aria-hidden="true" className="text-xl">↗</span></div><p className="mt-4 font-mono text-xs">{count.toLocaleString()} PROBLEMS</p>{connected && <div className="desk-topic-progress"><div><span>{solved.toLocaleString()} solved · {attempted} unfinished</span><strong>{percent}%</strong></div><span className="desk-topic-progress-track"><span style={{width:`${percent}%`}} /></span></div>}</Link>;
}
