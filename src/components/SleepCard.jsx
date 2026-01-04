import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Moon, Clock } from 'lucide-react';
import { differenceInMinutes, parse, format } from 'date-fns';

export function SleepCard({ habit, log, onUpdate }) {
    const [start, setStart] = useState(log?.start || '');
    const [end, setEnd] = useState(log?.end || '');

    // Sync internal state if log changes externally
    useEffect(() => {
        if (log?.start) setStart(log.start);
        if (log?.end) setEnd(log.end);
    }, [log]);

    const calculateDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return 0;

        const today = new Date();
        const dStart = parse(startTime, 'HH:mm', today);
        const dEnd = parse(endTime, 'HH:mm', today);

        // Handle overnight (e.g. 23:00 to 07:00)
        if (dEnd < dStart) {
            dEnd.setDate(dEnd.getDate() + 1);
        }

        return differenceInMinutes(dEnd, dStart);
    };

    const handleBlur = () => {
        if (start && end) {
            const minutes = calculateDuration(start, end);
            const hours = (minutes / 60).toFixed(1);

            const targetMin = habit.goal?.min_duration_minutes || 420; // 7h default
            const status = minutes >= targetMin ? 'completed' : 'pending';

            onUpdate({
                start,
                end,
                value: Number(hours),
                status
            });
        }
    };

    const hoursLogged = log?.value || 0;
    const isCompleted = log?.status === 'completed';

    return (
        <div className={clsx('tracker-card sleep-card', isCompleted && 'completed')}>
            <div className="card-content flex flex-col w-full gap-3 py-3">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <div className={clsx('icon-box', isCompleted ? 'bg-green' : 'bg-indigo')}>
                            <Moon size={18} className={isCompleted ? 'text-black' : 'text-indigo-400'} fill={isCompleted ? 'currentColor' : 'none'} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-medium leading-tight">Sleep</span>
                            {hoursLogged > 0 && (
                                <span className="text-[10px] text-secondary font-mono">{hoursLogged} hrs</span>
                            )}
                        </div>
                    </div>
                    {isCompleted && <div className="goal-badge">GOAL MET</div>}
                </div>

                <div className="time-inputs flex gap-3 pl-[48px]">
                    <div className="flex flex-col gap-1 flex-1">
                        <label className="text-[10px] text-secondary uppercase tracking-wider">Bedtime</label>
                        <div className="input-wrapper">
                            <input
                                type="time"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                onBlur={handleBlur}
                                className="time-input"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                        <label className="text-[10px] text-secondary uppercase tracking-wider">Wake Up</label>
                        <div className="input-wrapper">
                            <input
                                type="time"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                onBlur={handleBlur}
                                className="time-input"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
