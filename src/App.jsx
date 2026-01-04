import { useState } from 'react';
import { Layout } from './components/Layout';
import { Sheet } from './components/Sheet';
import { WaterCard } from './components/WaterCard';
import { SleepCard } from './components/SleepCard';
import { WeeklyGrid } from './components/WeeklyGrid';
import { TrendCard } from './components/TrendCard';
import { format, startOfWeek, endOfWeek, addWeeks } from 'date-fns';
import { useStore } from './hooks/useStore';
import { Check, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

import { RoutineSection } from './components/RoutineSection';

function App() {
  const [activeTab, setActiveTab] = useState('today');
  const { habits, currentDayLogs, toggleHabit, addHabit, updateHabitLog, getStreaks } = useStore();

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'today' && (
        <DailyView
          habits={habits}
          logs={currentDayLogs}
          onToggle={toggleHabit}
          onUpdateLog={updateHabitLog}
          onAdd={addHabit}
          getStreaks={getStreaks}
        />
      )}
      {activeTab === 'stats' && <StatsView habits={habits} />}
      {activeTab === 'settings' && <SettingsView habits={habits} />}
    </Layout>
  );
}

function DailyView({ habits, logs, onToggle, onUpdateLog, onAdd, getStreaks }) {
  const today = format(new Date(), 'EEE, dd MMM');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');

  const streaks = getStreaks();

  // Calculate daily completion (granular)
  let completedCount = 0;
  let totalCount = 0;

  habits.forEach(h => {
    if (h.type === 'multi_check') {
      const checked = logs[h.id]?.checked_items || [];
      completedCount += checked.length;
      totalCount += h.items.length;
    } else {
      totalCount += 1;
      if (logs[h.id]?.status === 'completed') {
        completedCount += 1;
      }
    }
  });

  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleSave = (e) => {
    e.preventDefault();
    if (newHabitTitle.trim()) {
      onAdd(newHabitTitle.trim());
      setNewHabitTitle('');
      setIsSheetOpen(false);
    }
  };

  const sections = [
    { id: 'morning', title: 'Morning Routine' },
    { id: 'daytime', title: 'Daytime Routine' },
    { id: 'evening', title: 'Evening Routine' },
    { id: 'night', title: 'Night Routine' },
    { id: 'other', title: 'Other' }
  ];

  const renderHabitCard = (habit) => {
    const status = logs[habit.id]?.status || 'pending';
    const isCompleted = status === 'completed';

    if (habit.type === 'count') {
      return (
        <WaterCard
          key={habit.id}
          habit={habit}
          log={logs[habit.id]}
          onUpdate={(data) => onUpdateLog(habit.id, data)}
        />
      );
    }

    if (habit.type === 'multi_check') {
      const checkedItems = logs[habit.id]?.checked_items || [];
      return (
        <div key={habit.id} className="flex-col gap-0">
          {habit.items.map(item => {
            const isChecked = checkedItems.includes(item);
            return (
              <button
                key={item}
                className="subtask-row"
                onClick={() => {
                  const newChecked = isChecked
                    ? checkedItems.filter(i => i !== item)
                    : [...checkedItems, item];
                  onUpdateLog(habit.id, {
                    checked_items: newChecked,
                    status: newChecked.length === habit.items.length ? 'completed' : 'pending'
                  });
                }}
              >
                <div className={clsx('checkbox-small', isChecked && 'checked')}>
                  {isChecked && <Check size={14} strokeWidth={3} color="#000" />}
                </div>
                <span className={clsx('text-[15px] font-medium', isChecked && 'text-dim')}>
                  {item}
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    if (habit.type === 'time_range') {
      return (
        <SleepCard
          key={habit.id}
          habit={habit}
          log={logs[habit.id]}
          onUpdate={(data) => onUpdateLog(habit.id, data)}
        />
      );
    }

    return (
      <button
        key={habit.id}
        onClick={() => onToggle(habit.id)}
        className={clsx('habit-card', isCompleted && 'completed')}
      >
        <div className="flex items-center gap-4 full-width">
          <div className={clsx('checkbox', isCompleted && 'checked')}>
            {isCompleted && <Check size={16} strokeWidth={3} color="#000" />}
          </div>

          <div className="flex-1 flex flex-col items-start">
            <span className={clsx('habit-title', isCompleted && 'text-dim')}>
              {habit.title}
            </span>
          </div>

          {streaks[habit.id] > 0 && (
            <div className="streak-badge">
              🔥 {streaks[habit.id]}
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="flex-col gap-4">
      <header className="flex justify-between items-center py-4">
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)' }}>{today}</h1>
          <p className="text-sm text-secondary">
            {completedCount} / {totalCount} completed ({completionPercentage}%)
          </p>
        </div>
      </header>

      {/* Daily Progress Bar */}
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      <section className="flex-col gap-2">
        {habits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3 className="empty-state-title">No habits yet</h3>
            <p className="empty-state-text">
              Start tracking your daily habits by creating your first one below.
            </p>
          </div>
        ) : (
          sections.map(section => {
            const sectionHabits = habits.filter(h =>
              (section.id === 'other' ? !h.section || h.section === 'other' : h.section === section.id)
            );

            if (sectionHabits.length === 0) return null;

            return (
              <RoutineSection
                key={section.id}
                title={section.title}
                habits={sectionHabits}
                logs={logs}
              >
                {sectionHabits.map(renderHabitCard)}
              </RoutineSection>
            );
          })
        )}
      </section>


      <button
        className="add-habit-btn flex items-center justify-center gap-2"
        onClick={() => setIsSheetOpen(true)}
      >
        <Plus size={18} />
        <span>New Habit</span>
      </button>

      <Sheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="New Habit"
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              autoFocus
              className="form-input"
              placeholder="e.g. Read 10 mins"
              value={newHabitTitle}
              onChange={e => setNewHabitTitle(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary">
            Create Habit
          </button>
        </form>
      </Sheet>
    </div>
  );
}



function StatsView({ habits }) {
  const { logs, toggleHabit } = useStore();
  const [weekOffset, setWeekOffset] = useState(0);

  const currentWeek = addWeeks(new Date(), weekOffset);
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const canGoForward = weekOffset >= 0;

  return (
    <div className="flex-col gap-4">
      <h1 className="text-xl py-4">Performance</h1>

      {/* Week Navigation */}
      <div className="week-nav">
        <button
          className="week-nav-btn"
          onClick={() => setWeekOffset(weekOffset - 1)}
          aria-label="Previous week"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="text-center">
          <div className="text-sm font-medium">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </div>
          {weekOffset === 0 && (
            <div className="text-xs text-secondary mt-1">This Week</div>
          )}
        </div>

        <button
          className="week-nav-btn"
          onClick={() => setWeekOffset(weekOffset + 1)}
          disabled={canGoForward}
          aria-label="Next week"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Trend Comparison */}
      <TrendCard habits={habits} logs={logs} currentWeekOffset={weekOffset} />

      {/* Weekly Grid */}
      <WeeklyGrid
        habits={habits}
        logs={logs}
        weekOffset={weekOffset}
        onToggle={toggleHabit}
      />
    </div>
  );
}

function SettingsView({ habits }) {
  const { deleteHabit } = useStore();

  const handleExport = () => {
    const data = {
      habits: storage.getHabits(),
      logs: storage.getLogs(),
      settings: localStorage.getItem('void_settings_v1') ? JSON.parse(localStorage.getItem('void_settings_v1')) : {},
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `void_tracker_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.habits && data.logs) {
          localStorage.setItem('void_habits_v1', JSON.stringify(data.habits));
          localStorage.setItem('void_logs_v1', JSON.stringify(data.logs));
          if (data.settings) localStorage.setItem('void_settings_v1', JSON.stringify(data.settings));
          window.location.reload(); // Refresh to apply changes
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Error parsing backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleWipe = () => {
    if (confirm('CRITICAL: This will delete ALL your habits and history. This cannot be undone. Are you sure?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex-col gap-6">
      <h1 className="text-xl py-4">Settings</h1>

      <section className="settings-section">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-3">Habit Management</h2>
        <div className="flex-col gap-2">
          {habits.map(habit => (
            <div key={habit.id} className="settings-item flex justify-between items-center">
              <span className="text-sm">{habit.title}</span>
              <button
                className="text-xs text-red-500 hover:text-red-400 p-2"
                onClick={() => {
                  if (confirm(`Delete "${habit.title}"? History will be hidden but remains in logs.`)) {
                    deleteHabit(habit.id);
                  }
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-3">Backup & Portability</h2>
        <div className="flex-col gap-3">
          <button className="btn-secondary w-full" onClick={handleExport}>
            Export Data (.json)
          </button>

          <label className="btn-secondary w-full text-center cursor-pointer inline-block">
            Import Data
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </section>

      <section className="settings-section mt-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-red-500 mb-3">Danger Zone</h2>
        <button className="btn-destructive w-full" onClick={handleWipe}>
          Wipe All Data
        </button>
      </section>

      <div className="py-8 text-center opacity-30">
        <p className="text-[10px] font-mono">VOID TRACKER v1.0 / OFFLINE FIRST</p>
      </div>
    </div>
  );
}

export default App;
