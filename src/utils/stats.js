import { format, subDays, parseISO } from 'date-fns';

export function calculateStreak(habitId, logs) {
    const today = new Date();
    let streak = 0;
    let currentDate = today;

    // Check backwards from today
    while (true) {
        const dateKey = format(currentDate, 'yyyy-MM-dd');
        const log = logs[dateKey]?.[habitId];

        if (log?.status === 'completed') {
            streak++;
            currentDate = subDays(currentDate, 1);
        } else {
            break;
        }
    }

    return streak;
}

export function getCompletionStats(habits, logs, dateKey) {
    let total = habits.length;
    let completed = 0;

    habits.forEach(habit => {
        const log = logs[dateKey]?.[habit.id];
        if (log?.status === 'completed') {
            completed++;
        }
    });

    return {
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
}
