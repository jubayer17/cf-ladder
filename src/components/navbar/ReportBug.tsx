"use client";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
export default function ReportBug() {
  const [show, setShow] = useState(false), [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]), [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  async function sendReport(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || loading) return;
    if (files.length > 3 || files.reduce((n,f) => n + f.size,0) > 5 * 1024 * 1024) { setStatus('Use up to 3 files totaling at most 5 MB.'); return; }
    setLoading(true); setStatus(null);
    try {
      const form = new FormData(); form.append('text',message.trim());
      files.forEach(f => form.append('files', f));
      const response = await fetch('/api/send-bug', { method: 'POST', body: form, signal: AbortSignal.timeout(30000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to send report');
      setStatus('Report sent. Thank you for helping improve CF Ladder.'); setMessage(''); setFiles([]);
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Unable to send report. Please try again.'); }
    finally { setLoading(false); }
  }
  return <Dialog open={show} onOpenChange={open => { if (!loading) { setShow(open); setStatus(null); } }}><DialogTrigger className="desk-report rounded-lg border px-2 py-2 text-xs shrink-0 font-medium hover:bg-muted" aria-label="Report a bug">Report</DialogTrigger><DialogContent><DialogHeader><DialogTitle>Help us improve</DialogTitle><DialogDescription>Describe what happened and what you expected. Attach up to 3 images or text files, totaling 5 MB.</DialogDescription></DialogHeader><form onSubmit={sendReport} className="space-y-4"><label className="block text-sm font-medium">What went wrong?<textarea required maxLength={5000} disabled={loading} value={message} onChange={e => setMessage(e.target.value)} rows={5} className="mt-2 w-full rounded-lg border bg-background p-3" /></label><label className="block text-sm font-medium">Attachments (optional)<input key={files.length ? 'selected' : 'empty'} type="file" accept="image/png,image/jpeg,image/webp,image/gif,text/plain" multiple disabled={loading} onChange={e => setFiles(Array.from(e.target.files || []))} className="mt-2 block w-full text-sm" /></label>{status && <p role="status" className="text-sm">{status}</p>}<div className="flex justify-end gap-2"><button type="button" disabled={loading} onClick={() => setShow(false)} className="rounded-lg border px-4 py-2">Close</button><button disabled={loading || !message.trim()} className="rounded-lg bg-blue-600 text-white px-4 py-2 disabled:opacity-50">{loading ? 'Sending…' : 'Send report'}</button></div></form></DialogContent></Dialog>;
}
