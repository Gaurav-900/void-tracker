import { startOfWeek, endOfWeek, eachDayOfInterval, format, subWeeks, addWeeks, isSameDay } from 'date-fns';
import { clsx } from 'clsx';

export function WeeklyGrid({ habits, logs, weekOffset = 0, onToggle }) {
    const today = new Date();
    const targetWeek = weekOffset === 0 ? today : addWeeks(today, weekOffset);

    // Calculate window
    const start = startOfWeek(targetWeek, { weekStartsOn: 1 }); // Monday start
    const end = endOfWeek(targetWeek, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });

    return (
        <div className="weekly-grid-container">
            <div className="grid-header">
                <div className="corner-spacer" />
                {days.map(day => {
                    const isToday = isSameDay(day, today);
                    return (
                        <div key={day.toString()} className={clsx('day-header', isToday && 'is-today')}>
                            {format(day, 'EEEEE')}
                        </div>
                    )
                })}
            </div>

            <div className="grid-body">
                {habits.map(habit => (
                    <div key={habit.id} className="grid-row">
                        <div className="habit-label truncate">
                            {habit.title}
                        </div>
                        {days.map(day => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const log = logs[dateKey]?.[habit.id];
                            let status = log?.status || 'pending';
                            const isFuture = day > today;
                            const isPast = !isFuture && !isSameDay(day, today);

                            // Honest missed-day handling: if past and still pending, it's a 'missed' state
                            if (isPast && status === 'pending') {
                                status = 'failed';
                            }

                            return (
                                <button
                                    key={`${habit.id}-${dateKey}`}
                                    onClick={() => !isFuture && onToggle(habit.id, dateKey)}
                                    disabled={isFuture}
                                    className={clsx(
                                        'grid-cell',
                                        status,
                                        isFuture && 'future'
                                    )}
                                    aria-label={`Toggle ${habit.title} for ${dateKey}`}
                                    aria-pressed={status === 'completed'}
                                />
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
