import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export function RoutineSection({ title, children, habits, logs }) {
    const [isOpen, setIsOpen] = useState(true);

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
        <div className={clsx('routine-section', isFull && 'section-complete')}>
            <button
                className="section-header flex items-center justify-between w-full py-2"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-secondary">
                            {title}
                        </h2>
                        {isFull && <CheckCircle2 size={14} className="text-accent-primary" />}
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
                <div className="p-1 opacity-50">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </button>

            {isOpen && (
                <div className="section-content flex-col gap-4 mt-2">
                    {children}
                </div>
            )}
        </div>
    );
}
