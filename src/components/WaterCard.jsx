import { Minus, Plus, Droplet } from 'lucide-react';
import { clsx } from 'clsx';

export function WaterCard({ habit, log, onUpdate }) {
    const current = log?.value || 0;
    const target = habit.goal?.target || 8;
    const progress = Math.min((current / target) * 100, 100);
    const isCompleted = current >= target;

    const handleIncrement = (e) => {
        e.stopPropagation();
        onUpdate({ value: current + 1, status: current + 1 >= target ? 'completed' : 'pending' });
    };

    const handleDecrement = (e) => {
        e.stopPropagation();
        if (current > 0) {
            onUpdate({ value: current - 1, status: 'pending' });
        }
    };

    return (
        <div className={clsx('tracker-card water-card', isCompleted && 'completed')}>
            {/* Background Progress Bar */}
            <div className="progress-bg" style={{ width: `${progress}%` }} />

            <div className="card-content flex items-center justify-between relative z-10 w-full">
                <div className="flex items-center gap-3">
                    <div className={clsx('icon-box', isCompleted ? 'bg-green' : 'bg-blue')}>
                        <Droplet size={18} className={isCompleted ? 'text-black' : 'text-blue-400'} fill={isCompleted ? 'currentColor' : 'none'} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-medium">Water</span>
                        <span className="text-xs text-secondary">{current} / {target} bottles</span>
                    </div>
                </div>

                <div className="controls flex items-center gap-2">
                    <button
                        onClick={handleDecrement}
                        className="control-btn"
                        disabled={current === 0}
                        aria-label="Decrease water count"
                    >
                        <Minus size={16} />
                    </button>
                    <button
                        onClick={handleIncrement}
                        className="control-btn add"
                        aria-label="Increase water count"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
