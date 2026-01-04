import { v4 as uuidv4 } from 'uuid';

const KEYS = {
    HABITS: 'void_habits_v1',
    LOGS: 'void_logs_v1',
    SETTINGS: 'void_settings_v1'
};

const DEFAULT_HABITS = [
    {
        id: 'h_morning',
        title: 'Morning Routine',
        type: 'multi_check',
        section: 'morning',
        items: ['Drink 500ml Water', 'Cleanser', 'Moisturizer', 'Sunscreen', 'Posture Check'],
        created_at: new Date().toISOString(),
        archived: false
    },
    {
        id: 'h_water',
        title: 'Water Intake',
        type: 'count',
        section: 'daytime',
        goal: { target: 3, unit: 'bottles' },
        created_at: new Date().toISOString(),
        archived: false
    },
    {
        id: 'h_daytime',
        title: 'Daytime Routine',
        type: 'multi_check',
        section: 'daytime',
        items: ['Sabzi + Roti Eaten', 'Shake Taken', 'Gym Done', 'Face Pulls Done'],
        created_at: new Date().toISOString(),
        archived: false
    },
    {
        id: 'h_evening',
        title: 'Evening Routine',
        type: 'multi_check',
        section: 'evening',
        items: ['Chin Tucks', 'Tongue to Palate (Mewing)', 'Neck Extensions'],
        created_at: new Date().toISOString(),
        archived: false
    },
    {
        id: 'h_night',
        title: 'Night Routine',
        type: 'multi_check',
        section: 'night',
        items: ['PM Cleanser', 'PM Moisturizer', 'Light Water Intake', 'Screen Off before Sleep'],
        created_at: new Date().toISOString(),
        archived: false
    },
    {
        id: 'h_sleep',
        title: 'Sleep',
        type: 'time_range',
        section: 'night',
        goal: { min_duration_minutes: 420 }, // 7 hours
        created_at: new Date().toISOString(),
        archived: false
    }
];

export const storage = {
    // --- Habits ---
    getHabits: () => {
        try {
            const data = localStorage.getItem(KEYS.HABITS);
            return data ? JSON.parse(data) : DEFAULT_HABITS;
        } catch (e) {
            console.error('Storage Error:', e);
            return [];
        }
    },

    saveHabits: (habits) => {
        localStorage.setItem(KEYS.HABITS, JSON.stringify(habits));
    },

    addHabit: (habitData) => {
        const habits = storage.getHabits();
        const newHabit = {
            id: uuidv4(),
            created_at: new Date().toISOString(),
            archived: false,
            ...habitData
        };
        const updated = [...habits, newHabit];
        storage.saveHabits(updated);
        return updated;
    },

    // --- Logs ---
    getLogs: () => {
        try {
            const data = localStorage.getItem(KEYS.LOGS);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    },

    getLogsForDate: (dateStr) => {
        const logs = storage.getLogs();
        return logs[dateStr] || {};
    },

    updateLog: (dateStr, habitId, updateFn) => {
        const logs = storage.getLogs();
        const dayLogs = logs[dateStr] || {};
        const currentEntry = dayLogs[habitId] || { value: 0, status: 'pending' };

        // Calculate new state
        const newEntry = updateFn(currentEntry);

        // Save back
        logs[dateStr] = {
            ...dayLogs,
            [habitId]: newEntry
        };

        localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
        return logs;
    }
};
