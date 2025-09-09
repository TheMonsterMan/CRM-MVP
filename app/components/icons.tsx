import * as React from 'react';

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export function IconPipeline({ size = 20, ...props }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* stacked columns = pipeline */}
      <rect x="3" y="4" width="5" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <rect x="9.5" y="8" width="5" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
      <rect x="16" y="12" width="5" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export function IconDeals({ size = 20, ...props }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* handshake-ish */}
      <path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 9l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 7l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconAccounts({ size = 20, ...props }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* building */}
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconContacts({ size = 20, ...props }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* user circle */}
      <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="2"/>
      <path d="M5 19.5a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
