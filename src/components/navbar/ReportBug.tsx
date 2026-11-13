'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import StatePanel from '@/components/StatePanel';
export default function ReportBug() {
  const [show,setShow] = useState(false),[message,setMessage] = useState('');
  const [files,setFiles] = useState<File[]>([]),[loading,setLoading] = useState(false);
  const [status,setStatus] = useState<{ tone:'success' | 'error'; text:string } | null>(null);
  async function sendReport(e: React.FormEvent) {
    e.preventDefault(); if (!message.trim() || loading) return;
    if (files.length>3 || files.reduce((sum,file) => sum+file.size,0)>5*1024*1024) {setStatus({tone:'error',text:'Use up to 3 files totaling at most 5 MB.'});return;}
    setLoading(true);setStatus(null);
    try {
      const form=new FormData();form.append('text',message.trim());files.forEach(file => form.append('files',file));
      const response=await fetch('/api/send-bug',{method:'POST',body:form,signal:AbortSignal.timeout(30000)});
      const data=await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to send the report');
      setStatus({tone:'success',text:'Your report was sent. Thank you for helping improve CF Ladder.'});setMessage('');setFiles([]);
    } catch (error) {setStatus({tone:'error',text:error instanceof Error ? error.message : 'Unable to send the report. Please try again.'});}
    finally {setLoading(false);}
  }
  return <Dialog open={show} onOpenChange={open => {if (!loading) {setShow(open);setStatus(null);}}}><DialogTrigger className="desk-report border px-2 py-2 text-xs shrink-0 font-medium" aria-label="Report a bug">Report</DialogTrigger><DialogContent className="desk-dialog"><DialogHeader><DialogTitle>Report a problem</DialogTitle><DialogDescription>Tell us what happened and what you expected. Up to 3 images or text files, totaling 5 MB.</DialogDescription></DialogHeader><form onSubmit={sendReport} className="space-y-4"><label className="block text-sm font-medium">What went wrong?<textarea required maxLength={5000} disabled={loading} value={message} onChange={e => setMessage(e.target.value)} rows={5} className="desk-textarea mt-2" /></label><label className="block text-sm font-medium">Attachments (optional)<input key={files.length ? 'selected' : 'empty'} type="file" accept="image/png,image/jpeg,image/webp,image/gif,text/plain" multiple disabled={loading} onChange={e => setFiles(Array.from(e.target.files || []))} className="mt-2 block w-full text-xs" /></label>{status && <StatePanel tone={status.tone} title={status.tone==='success' ? 'Report sent' : 'The report was not sent'} description={status.text} compact />}{loading && <StatePanel tone="loading" title="Sending your report…" description="Please keep this dialog open while the report is sent." compact />}<div className="flex justify-end gap-2"><button type="button" disabled={loading} onClick={() => setShow(false)} className="desk-secondary">Close</button><button disabled={loading || !message.trim()} className="desk-action">{loading ? 'Sending…' : 'Send report'}</button></div></form></DialogContent></Dialog>;
}
