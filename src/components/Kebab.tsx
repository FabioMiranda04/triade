import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon';

interface KebabAction {
  label: string;
  icon?: IconName;
  onClick: () => void;
}

interface KebabProps {
  label: string;
  actions: KebabAction[];
}

/** Botão "..." com um menu flutuante de cantos arredondados, estilo Instagram. */
export function Kebab({ label, actions }: KebabProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="kebab" ref={ref}>
      <button
        className="act-btn"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="more" size={18} />
      </button>
      {open && (
        <div className="kebab-menu glass-strong" role="menu">
          {actions.map((a) => (
            <button
              key={a.label}
              role="menuitem"
              className="kebab-item"
              onClick={() => {
                setOpen(false);
                a.onClick();
              }}
            >
              {a.icon && <Icon name={a.icon} size={15} />}
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
