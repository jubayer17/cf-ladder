const known: Record<string, string> = {
  'implementation':'coral', 'math':'blue', 'greedy':'mint', 'brute force':'lilac',
  'constructive algorithms':'amber', 'dfs and similar':'blue', 'dsu':'rose', 'graphs':'mint', 'trees':'lilac',
  'data structures':'teal', 'strings':'rose', 'dp':'lilac', 'sortings':'amber', 'number theory':'teal',
  'binary search':'coral', 'geometry':'blue', 'bitmasks':'amber', 'two pointers':'mint', 'games':'rose',
};
const tones = ['lilac','mint','blue','coral','amber','rose','teal'];
export function topicTone(topic: string): string {
  return known[topic] || tones[Array.from(topic).reduce((sum,c) => sum+c.charCodeAt(0),0) % tones.length];
}
