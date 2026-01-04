import { useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import { format } from 'date-fns';

export function useStore() {
    const [habits, setHabits] = useState([]);
    const [logs, setLogs] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Initial Load
    useEffect(() => {
        const loadedHabits = storage.getHabits();
        const loadedLogs = storage.getLogs();

        // Simple migration: if core routine habits are missing, add them
        const defaultIds = ['h_morning', 'h_water', 'h_daytime', 'h_evening', 'h_night', 'h_sleep'];
        let updatedHabits = [...loadedHabits];
        let hasChanges = false;

        const currentIds = updatedHabits.map(h => h.id);
        const missing = storage.getHabits().filter(h => defaultIds.includes(h.id) && !currentIds.includes(h.id));

        if (missing.length > 0) {
            updatedHabits = [...updatedHabits, ...missing];
            hasChanges = true;
        }

        // Specific fix for water goal: change 8 to 3
        updatedHabits = updatedHabits.map(h => {
            if (h.id === 'h_water' && h.goal?.target === 8) {
                hasChanges = true;
                return { ...h, goal: { ...h.goal, target: 3 } };
            }
            return h;
        });

        if (hasChanges) {
            storage.saveHabits(updatedHabits);
            setHabits(updatedHabits);
        } else {
            setHabits(loadedHabits);
        }

        setLogs(loadedLogs);
    }, []);

    const dateKey = format(selectedDate, 'yyyy-MM-dd');

    const toggleHabit = useCallback((habitId, targetDateKey = null) => {
        const activeDateKey = targetDateKey || dateKey;

        setLogs(prevLogs => {
            const dayLogs = prevLogs[activeDateKey] || {};
            const current = dayLogs[habitId] || { status: 'pending', value: 0 };

            let nextStatus = 'pending';
            let nextValue = 0;

            if (current.status !== 'completed') {
                nextStatus = 'completed';
                nextValue = 1;
            }

            const newEntry = { status: nextStatus, value: nextValue };

            const newLogs = {
                ...prevLogs,
                [activeDateKey]: {
                    ...dayLogs,
                    [habitId]: newEntry
                }
            };

            localStorage.setItem('void_logs_v1', JSON.stringify(newLogs));
            return newLogs;
        });
    }, [dateKey]);


    const addHabit = useCallback((title) => {
        const updated = storage.addHabit({ title, type: 'check' });
        setHabits(updated);
    }, []);

    const deleteHabit = useCallback((habitId) => {
        setHabits(prev => {
            const updated = prev.filter(h => h.id !== habitId);
            storage.saveHabits(updated);
            return updated;
        });
        // Cleanup logs? Usually better to keep historical logs but remove the habit definition.
        // For now, we just remove the habit.
    }, []);

    const updateHabitLog = useCallback((habitId, updateData, targetDateKey = null) => {
        const activeDateKey = targetDateKey || dateKey;

        setLogs(prevLogs => {
            const dayLogs = prevLogs[activeDateKey] || {};
            const newLogs = {
                ...prevLogs,
                [activeDateKey]: {
                    ...dayLogs,
                    [habitId]: updateData
                }
            };
            localStorage.setItem('void_logs_v1', JSON.stringify(newLogs));
            return newLogs;
        });
    }, [dateKey]);

    const getStreaks = useCallback(() => {
        const streaks = {};
        habits.forEach(habit => {
            let streak = 0;
            let currentDate = new Date();

            while (true) {
                const key = format(currentDate, 'yyyy-MM-dd');
                const log = logs[key]?.[habit.id];

                if (log?.status === 'completed') {
                    streak++;
                    currentDate.setDate(currentDate.getDate() - 1);
                } else {
                    break;
                }
            }

            streaks[habit.id] = streak;
        });
        return streaks;
    }, [habits, logs]);

    return {
        habits,
        logs,
        selectedDate,
        currentDayLogs: logs[dateKey] || {},
        toggleHabit,
        addHabit,
        deleteHabit,
        updateHabitLog,
        getStreaks
    };
}
