import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

export function Sheet({ isOpen, onClose, title, children }) {
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAnimateIn(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setAnimateIn(false), 200);
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !animateIn) return null;

    return createPortal(
        <div className={clsx('sheet-overlay', isOpen ? 'open' : 'closing')}>
            <div className="sheet-backdrop" onClick={onClose} />
            <div className={clsx('sheet-content', isOpen ? 'slide-up' : 'slide-down')}>
                <div className="sheet-handle" />
                <header className="sheet-header">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2"
                        aria-label="Close sheet"
                    >
                        <X size={24} className="text-secondary" />
                    </button>
                </header>
                <div className="sheet-body">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
