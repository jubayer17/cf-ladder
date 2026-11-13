import { useSyncExternalStore } from 'react';
const query = '(max-width: 767px)';
function subscribe(callback: () => void) { const mql = window.matchMedia(query); mql.addEventListener('change',callback); return () => mql.removeEventListener('change',callback); }
export function useIsMobile() { return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false); }
