import { useState } from 'react';
import { Layout } from './components/Layout';
import { Sheet } from './components/Sheet';
import { WaterCard } from './components/WaterCard';
import { SleepCard } from './components/SleepCard';
import { WeeklyGrid } from './components/WeeklyGrid';
import { TrendCard } from './components/TrendCard';
import { format, startOfWeek, endOfWeek, addWeeks, addDays, isToday as isTodayFn, subDays } from 'date-fns';
import { useStore } from './hooks/useStore';
import { Check, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

import { RoutineSection } from './components/RoutineSection';
import { HabitForm } from './components/HabitForm';
import { storage } from './services/storage';

function App() {
  const [activeTab, setActiveTab] = useState('today');
  const { habits, logs, currentDayLogs, toggleHabit, addHabit, updateHabit, deleteHabit, updateHabitLog, getStreaks, selectedDate, setSelectedDate } = useStore();

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'today' && (
        <DailyView
          habits={habits}
          logs={currentDayLogs}
          onToggle={toggleHabit}
          onUpdateLog={updateHabitLog}
          onAdd={addHabit}
          onUpdateHabit={updateHabit}
          onDeleteHabit={deleteHabit}
          getStreaks={getStreaks}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      )}
      {activeTab === 'stats' && <StatsView habits={habits} logs={logs} onToggle={toggleHabit} />}
      {activeTab === 'settings' && <SettingsView habits={habits} onDelete={deleteHabit} />}
    </Layout>
  );
}

function DailyView({
  habits,
  logs,
  onToggle,
  onUpdateLog,
  onAdd,
  onUpdateHabit,
  onDeleteHabit,
  getStreaks,
  selectedDate,
  onDateChange
}) {
  const displayDate = format(selectedDate, 'EEE, dd MMM');
  const isToday = isTodayFn(selectedDate);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const handlePrevDay = () => onDateChange(subDays(selectedDate, 1));
  const handleNextDay = () => onDateChange(addDays(selectedDate, 1));
  const handleGoToday = () => onDateChange(new Date());

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

  const handleCreate = (data) => {
    onAdd(data);
    setIsSheetOpen(false);
  };

  const handleUpdate = (data) => {
    onUpdateHabit(editingHabit.id, data);
    setEditingHabit(null);
    setIsSheetOpen(false);
  };

  const handleDelete = (id) => {
    onDeleteHabit(id);
    setEditingHabit(null);
    setIsSheetOpen(false);
  };

  const handleRenameSection = (oldId, newName) => {
    const newId = newName.toLowerCase().trim().replace(/\s+/g, '_');
    habits.forEach(h => {
      if (h.section === oldId || (oldId === 'other' && !h.section)) {
        onUpdateHabit(h.id, { section: newId });
      }
    });
  };

  // Derive sections dynamically
  const availableSections = Array.from(new Set(habits.map(h => h.section || 'other')));
  const sectionConfig = {
    morning: 'Morning Routine',
    daytime: 'Daytime Routine',
    evening: 'Evening Routine',
    night: 'Night Routine',
    other: 'Other'
  };

  const sections = Object.entries(sectionConfig)
    .filter(([id]) => availableSections.includes(id))
    .map(([id, title]) => ({ id, title }));

  // Add custom sections not in the config
  availableSections.forEach(sid => {
    if (!sectionConfig[sid]) {
      sections.push({ id: sid, title: sid.charAt(0).toUpperCase() + sid.slice(1) });
    }
  });

  const renderHabitCard = (habit) => {
    const status = logs[habit.id]?.status || 'pending';
    const isCompleted = status === 'completed';

    const handleEditClick = (e) => {
      e.stopPropagation();
      setEditingHabit(habit);
      setIsSheetOpen(true);
    };

    if (habit.type === 'count') {
      return (
        <div key={habit.id} className="relative group">
          <WaterCard
            habit={habit}
            log={logs[habit.id]}
            onUpdate={(data) => onUpdateLog(habit.id, data)}
          />
          <button
            onClick={handleEditClick}
            className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-dim"
          >
            <Plus size={14} className="rotate-45" /> {/* Using Plus rotated as X/Edit for now or just Edit icon */}
          </button>
        </div>
      );
    }

    if (habit.type === 'multi_check') {
      const checkedItems = logs[habit.id]?.checked_items || [];
      return (
        <div key={habit.id} className="flex-col gap-0 group">
          <div className="flex justify-between items-center px-4 py-2">
            <span className="text-xs font-semibold text-secondary uppercase tracking-widest">{habit.title}</span>
            <button
              onClick={handleEditClick}
              className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-dim hover:text-primary"
            >
              <Plus size={14} className="rotate-45" />
            </button>
          </div>
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
                <span className={clsx('text-[15px] font-medium', isChecked && 'crossed text-dim')}>
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
        <div key={habit.id} className="relative group">
          <SleepCard
            habit={habit}
            log={logs[habit.id]}
            onUpdate={(data) => onUpdateLog(habit.id, data)}
          />
          <button
            onClick={handleEditClick}
            className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-dim"
          >
            <Plus size={14} className="rotate-45" />
          </button>
        </div>
      );
    }

    return (
      <button
        key={habit.id}
        onClick={() => onToggle(habit.id)}
        className={clsx('habit-card group', isCompleted && 'completed')}
      >
        <div className="flex items-center gap-4 full-width">
          <div className={clsx('checkbox', isCompleted && 'checked')}>
            {isCompleted && <Check size={16} strokeWidth={3} color="#000" />}
          </div>

          <div className="flex-1 flex flex-col items-start">
            <span className={clsx('habit-title', isCompleted && 'crossed text-dim')}>
              {habit.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {streaks[habit.id] > 0 && (
              <div className="streak-badge">
                🔥 {streaks[habit.id]}
              </div>
            )}
            <div
              onClick={handleEditClick}
              className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-dim hover:text-primary"
            >
              <Plus size={16} className="rotate-45" />
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div
      className="flex-col gap-4"
    >
      <header className="flex justify-between items-center py-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 style={{ fontSize: 'var(--text-xl)' }}>{displayDate}</h1>
            {isToday && <span className="today-badge">Today</span>}
          </div>
          <p className="text-sm text-secondary">
            {completedCount} / {totalCount} completed ({completionPercentage}%)
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-dim"
            onClick={handlePrevDay}
            aria-label="Previous day"
          >
            <ChevronLeft size={20} />
          </button>
          {!isToday && (
            <button
              className="text-xs font-medium px-3 py-1 hover:bg-white/5 rounded-full transition-colors"
              onClick={handleGoToday}
            >
              Today
            </button>
          )}
          <button
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-dim"
            onClick={handleNextDay}
            aria-label="Next day"
          >
            <ChevronRight size={20} />
          </button>
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
                onRename={(newName) => handleRenameSection(section.id, newName)}
              >
                {sectionHabits.map(renderHabitCard)}
              </RoutineSection>
            );
          })
        )}
      </section>

      <button
        className="add-habit-btn flex items-center justify-center gap-2"
        onClick={() => {
          setEditingHabit(null);
          setIsSheetOpen(true);
        }}
      >
        <Plus size={18} />
        <span>New Habit</span>
      </button>

      <Sheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingHabit(null);
        }}
        title={editingHabit ? "Edit Habit" : "New Habit"}
      >
        <HabitForm
          habit={editingHabit}
          sections={sections}
          onSave={editingHabit ? handleUpdate : handleCreate}
          onDelete={handleDelete}
          onCancel={() => {
            setIsSheetOpen(false);
            setEditingHabit(null);
          }}
        />
      </Sheet>
    </div>
  );
}



function StatsView({ habits, logs, onToggle }) {
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
        onToggle={onToggle}
      />
    </div>
  );
}

function SettingsView({ habits, onDelete }) {

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
                  onDelete(habit.id);
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
