import type { JSX } from 'react';

/**
 * Ícones SVG inline, estilo linha fina (stroke 1.9) — sem biblioteca externa.
 * Para adicionar um ícone novo: acrescente uma chave em `PATHS` e ele já
 * fica disponível como <Icon name="..." />.
 */

export type IconName =
  | 'heart'
  | 'heartFill'
  | 'bookmark'
  | 'bookmarkFill'
  | 'comment'
  | 'share'
  | 'more'
  | 'search'
  | 'bell'
  | 'home'
  | 'calendar'
  | 'mic'
  | 'sparkle'
  | 'check'
  | 'pin'
  | 'chevronRight';

const PATHS: Record<IconName, JSX.Element> = {
  heart: (
    <path
      d="M12 19.6s-6.6-4.05-8.9-8.2C1.5 8.1 2.6 5 5.6 4.5c1.9-.3 3.6.65 4.4 2.25C10.8 5.1 12.5 4.2 14.4 4.5c3 .5 4.1 3.6 3.3 6.9C15.4 15.55 12 19.6 12 19.6Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  heartFill: (
    <path
      d="M12 19.6s-6.6-4.05-8.9-8.2C1.5 8.1 2.6 5 5.6 4.5c1.9-.3 3.6.65 4.4 2.25C10.8 5.1 12.5 4.2 14.4 4.5c3 .5 4.1 3.6 3.3 6.9C15.4 15.55 12 19.6 12 19.6Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  bookmark: (
    <path d="M6.6 4h10.8a1 1 0 0 1 1 1v15l-6.4-4.1L5.6 20V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
  ),
  bookmarkFill: (
    <path d="M6.6 4h10.8a1 1 0 0 1 1 1v15l-6.4-4.1L5.6 20V5a1 1 0 0 1 1-1Z" fill="currentColor" stroke="none" />
  ),
  comment: (
    <path
      d="M4.6 6.3A2.3 2.3 0 0 1 6.9 4h10.2a2.3 2.3 0 0 1 2.3 2.3v7.6a2.3 2.3 0 0 1-2.3 2.3H10l-4 3.6v-3.6H6.9a2.3 2.3 0 0 1-2.3-2.3Z"
      strokeLinejoin="round"
    />
  ),
  share: (
    <>
      <path d="M21 3 3 10.3l6.8 2.4L11.9 21Z" strokeLinejoin="round" />
      <path d="M10 13 21 3" strokeLinecap="round" />
    </>
  ),
  more: (
    <>
      <circle cx="5.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  search: (
    <>
      <circle cx="10.6" cy="10.6" r="6.4" />
      <path d="M15.4 15.4 20 20" strokeLinecap="round" />
    </>
  ),
  bell: (
    <>
      <path d="M6 10.2a6 6 0 0 1 12 0v4.1l1.6 2.6H4.4L6 14.3Z" strokeLinejoin="round" />
      <path d="M9.6 19.4a2.4 2.4 0 0 0 4.8 0" strokeLinecap="round" />
    </>
  ),
  home: (
    <>
      <path d="M4 11.6 12 4.3l8 7.3" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M6.2 10.3V19.6h4.6v-5.8h2.4v5.8h4.6V10.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  calendar: (
    <>
      <rect x="3.3" y="5.2" width="17.4" height="15.4" rx="4" />
      <path d="M3.3 9.8h17.4M8 3.2v4M16 3.2v4" strokeLinecap="round" />
    </>
  ),
  mic: (
    <>
      <rect x="9.2" y="3.2" width="5.6" height="10.4" rx="2.8" />
      <path d="M5.4 11a6.6 6.6 0 0 0 13.2 0" strokeLinecap="round" />
      <path d="M12 17.6v2.8M9.4 20.4h5.2" strokeLinecap="round" />
    </>
  ),
  sparkle: <path d="M12 3.4 13.8 8.6 19 10.4l-5.2 1.8L12 17.4l-1.8-5.2L5 10.4l5.2-1.8Z" strokeLinejoin="round" />,
  check: <path d="M5 12.5 9.5 17 19 6.5" strokeLinecap="round" strokeLinejoin="round" />,
  pin: (
    <>
      <path d="M12 21s6.5-6.1 6.5-11A6.5 6.5 0 1 0 5.5 10c0 4.9 6.5 11 6.5 11Z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  chevronRight: <path d="M9 5.5 15.5 12 9 18.5" strokeLinecap="round" strokeLinejoin="round" />,
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 22, className = '' }: IconProps) {
  return (
    <svg
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
