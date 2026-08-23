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
  | 'chevronRight'
  | 'chevronLeft'
  | 'close'
  | 'users'
  | 'whatsapp'
  | 'edit'
  | 'plus'
  | 'settings';

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
  chevronLeft: <path d="M15 5.5 8.5 12 15 18.5" strokeLinecap="round" strokeLinejoin="round" />,
  close: <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />,
  users: (
    <>
      <circle cx="8.5" cy="8.5" r="3" />
      <circle cx="16" cy="9.5" r="2.4" />
      <path d="M3.5 19.5c.6-3.2 2.6-5 5-5s4.4 1.8 5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 14.8c2 .2 3.6 1.7 4.1 4.2" strokeLinecap="round" />
    </>
  ),
  whatsapp: (
    <path
      d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.19 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26C2.16 6.44 6.6 2 12.05 2c2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.9-9.88 9.9m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.09.55 4.14 1.59 5.94L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.48-8.4"
      fill="currentColor"
      stroke="none"
    />
  ),
  edit: (
    <path
      d="M4 20l.9-4 10.5-10.5a1.4 1.4 0 0 1 2 0l1.1 1.1a1.4 1.4 0 0 1 0 2L8 19l-4 1Z"
      strokeLinejoin="round"
    />
  ),
  plus: <path d="M12 5v14M5 12h14" strokeLinecap="round" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 3 13.09H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"
        strokeLinejoin="round"
      />
    </>
  ),
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
