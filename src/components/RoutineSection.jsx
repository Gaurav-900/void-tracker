import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export function RoutineSection({ title, children, habits, logs, onRename }) {
    const [isOpen, setIsOpen] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newTitle, setNewTitle] = useState(title);

    const handleRenameSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (newTitle.trim() && newTitle.trim() !== title) {
            onRename(newTitle.trim());
        }
        setIsEditing(false);
    };

    let completedSteps = 0;
    let totalSteps = 0;

    habits.forEach(h => {
        if (h.type === 'multi_check') {
            const checked = logs[h.id]?.checked_items || [];
            completedSteps += checked.length;
            totalSteps += h.items.length;
        } else {
            totalSteps += 1;
            if (logs[h.id]?.status === 'completed') {
                completedSteps += 1;
            }
        }
    });

    const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    const isFull = percentage === 100 && totalSteps > 0;

    if (habits.length === 0) return null;

    return (
        <div className={clsx('routine-section group', isFull && 'section-complete')}>
            <div className="section-header-container flex items-center justify-between w-full py-2">
                <div
                    className="flex flex-col items-start flex-1 cursor-pointer"
                    onClick={() => !isEditing && setIsOpen(!isOpen)}
                >
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <form onSubmit={handleRenameSubmit} className="flex gap-2">
                                <input
                                    autoFocus
                                    className="bg-hover border border-subtle text-xs font-bold uppercase tracking-widest text-primary p-1 rounded outline-none"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    onBlur={() => setIsEditing(false)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </form>
                        ) : (
                            <div className="flex items-center gap-2">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-secondary">
                                    {title}
                                </h2>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                                    className="p-1 opacity-0 hover:opacity-100 group-hover:opacity-50 text-[10px] text-dim"
                                >
                                    rename
                                </button>
                                {isFull && <CheckCircle2 size={14} className="text-accent-primary" />}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="section-mini-progress">
                            <div className="fill" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="text-[10px] text-dim font-mono">
                            {completedSteps}/{totalSteps}
                        </span>
                    </div>
                </div>
                {!isEditing && (
                    <div className="p-1 opacity-50 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="section-content flex-col gap-4 mt-2">
                    {children}
                </div>
            )}
        </div>
    );
}
