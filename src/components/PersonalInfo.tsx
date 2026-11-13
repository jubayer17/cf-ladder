"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Flame, Target, Trophy } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { getRatingName } from "@/utils/ratingColors";

interface PersonalInfoProps {
  profileImage?: string;
  fallbackImage?: string;
  handle?: string;
  rank?: string;
  currentRating?: number | null;
  maxRating?: number | null;
  profileUrl?: string;
  isLoading?: boolean;
}

function imageUrl(value?: string): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.startsWith("//") ? `https:${value}` : value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.hostname === "userpic.codeforces.org") url.protocol = "https:";
    return url.toString();
  } catch { return null; }
}

export default function PersonalInfo({ profileImage, fallbackImage, handle = "", rank, currentRating, maxRating, isLoading = false }: PersonalInfoProps) {
  const { solvedCountInProblems: solved, attemptedCountInProblems: attempted, notTriedCount: untouched, solvingStreak } = useAppContext();
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const candidates = [...new Set([imageUrl(profileImage), imageUrl(fallbackImage)].filter((url): url is string => !!url))];
  const src = candidates.find(url => !failedUrls.includes(url));
  const initials = handle.replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase() || "CF";
  const total = solved + attempted + untouched;
  const percent = total ? Math.round(solved / total * 1000) / 10 : 0;
  const statistics = [
    { label: "CURRENT RATING", value: currentRating ?? "—", icon: Target, className: "profile-stat-current" },
    { label: "PERSONAL BEST", value: maxRating ?? "—", icon: Trophy, className: "profile-stat-best" },
    { label: "LADDER SOLVES", value: solved.toLocaleString(), icon: Check, className: "profile-stat-solved" },
    { label: "LADDER RETRIES", value: attempted.toLocaleString(), icon: ArrowUpRight, className: "profile-stat-attempted" },
    { label: "SOLVING STREAK", value: `${solvingStreak}d`, icon: Flame, className: "profile-stat-streak" },
  ];

  if (isLoading) return <div role="status" aria-label="Loading profile" className="desk-panel h-48 animate-pulse bg-muted" />;

  return <section className="desk-profile" aria-label={`${handle}'s Codeforces record`}>
    <div className="profile-topline"><span className="desk-kicker">YOUR CODEFORCES RECORD</span><span className="profile-connected"><span aria-hidden="true" />CONNECTED</span></div>
    <div className="profile-identity-row">
      <div className="profile-avatar-frame">
        <div className="profile-avatar-fallback" role="img" aria-hidden={!!src && loadedUrl === src} aria-label={`${handle} profile initials`}>{initials}</div>
        {src && (
          // Codeforces hosts avatars remotely. Native images allow a reliable initials fallback on CDN failures.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={`${handle} profile`} width={88} height={88} referrerPolicy="no-referrer" className={`profile-avatar-image ${loadedUrl === src ? "is-loaded" : ""}`} onLoad={() => setLoadedUrl(src)} onError={() => setFailedUrls(previous => [...previous, src])} />
        )}
        <span className="profile-avatar-check" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
      </div>
      <div className="profile-name-block"><p className="desk-kicker text-muted-foreground mb-2">THE PERSON BEHIND THE SOLVES</p><a className="profile-handle" href={`https://codeforces.com/profile/${encodeURIComponent(handle)}`} target="_blank" rel="noopener noreferrer">{handle}<ArrowUpRight size={23} /></a><span className="profile-rank">{rank || getRatingName(currentRating)}</span></div>
      <div className="profile-completion"><span className="desk-kicker">LADDER COVERAGE</span><p>{percent}<span>%</span></p><span className="text-xs text-muted-foreground">Every solve leaves a mark.</span></div>
    </div>
    <div className="profile-stat-grid">{statistics.map(({ label, value, icon: Icon, className }) => <div key={label} className={`profile-stat ${className}`}><div className="profile-stat-label"><span>{label}</span><Icon size={15} strokeWidth={2} aria-hidden="true" /></div><p>{value}</p></div>)}</div>
    <div className="profile-progress-section"><div className="profile-progress-label"><span><strong>{solved.toLocaleString()}</strong> / {total.toLocaleString()} problems solved</span><span className="profile-progress-next">{untouched.toLocaleString()} still to explore ↗</span></div><div className="profile-progress-track" role="progressbar" aria-label="Ladder problems solved" aria-valuemin={0} aria-valuemax={total || 1} aria-valuenow={solved}><div style={{ width: `${total ? solved / total * 100 : 0}%` }} /></div></div>
  </section>;
}
