import { startOfWeek, endOfWeek, format, addWeeks } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function TrendCard({ habits, logs, currentWeekOffset }) {
    const today = new Date();

    // Current week
    const currentWeek = addWeeks(today, currentWeekOffset);
    const currentStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const currentEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

    // Previous week
    const prevWeek = addWeeks(currentWeek, -1);
    const prevStart = startOfWeek(prevWeek, { weekStartsOn: 1 });
    const prevEnd = endOfWeek(prevWeek, { weekStartsOn: 1 });

    // Calculate completion rates
    const calcCompletion = (start, end) => {
        let total = 0;
        let completed = 0;

        const days = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d));
        }

        days.forEach(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            habits.forEach(habit => {
                total++;
                const log = logs[dateKey]?.[habit.id];
                if (log?.status === 'completed') completed++;
            });
        });

        return total > 0 ? Math.round((completed / total) * 100) : 0;
    };

    const currentRate = calcCompletion(currentStart, currentEnd);
    const prevRate = calcCompletion(prevStart, prevEnd);
    const diff = currentRate - prevRate;

    const TrendIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
    const trendColor = diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-secondary';

    return (
        <div className="trend-card">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-2xl font-semibold">{currentRate}%</div>
                    <div className="text-xs text-secondary mt-1">Overall Completion</div>
                </div>
                <div className={`flex items-center gap-1 ${trendColor}`}>
                    <TrendIcon size={20} />
                    <span className="text-sm font-medium">
                        {diff > 0 ? '+' : ''}{diff}%
                    </span>
                </div>
            </div>
            <div className="text-xs text-secondary mt-2">
                vs previous week ({prevRate}%)
            </div>
        </div>
    );
}
