import TopicCard from './TopicCard';
export default function TopicGrid({ topics, connected = false }: { topics: { topic: string; count: number; solved?: number; attempted?: number }[]; connected?: boolean }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{topics.map(topic => <TopicCard key={topic.topic} {...topic} connected={connected} />)}</div>;
}
