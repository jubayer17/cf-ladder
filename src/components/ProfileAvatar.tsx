'use client';
import { useState } from 'react';
import { avatarSources } from '@/lib/avatar';
export default function ProfileAvatar({ handle, primary, fallback }: { handle: string; primary?: string; fallback?: string }) {
  const [failed,setFailed]=useState<string[]>([]),[loaded,setLoaded]=useState<string | null>(null);
  const src=avatarSources(primary,fallback).find(url => !failed.includes(url));
  const initials=handle.replace(/[^a-z0-9]/gi,'').slice(0,2).toUpperCase() || 'CF';
  return <><span className="profile-avatar-fallback" role="img" aria-hidden={!!src && loaded===src} aria-label={`${handle} profile initials`}>{initials}</span>{src && (
    // Native remote images allow progression through the cached proxy, original photos and initials.
    // eslint-disable-next-line @next/next/no-img-element
    <img className={`profile-avatar-image ${loaded===src ? 'is-loaded' : ''}`} src={src} width={88} height={88} alt={`${handle} profile`} referrerPolicy="no-referrer" onLoad={() => setLoaded(src)} onError={() => setFailed(previous => [...previous,src])} />
  )}</>;
}
