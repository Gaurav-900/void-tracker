import { useState, useEffect } from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import { clsx } from 'clsx';

export function HabitForm({ habit, onSave, onDelete, onCancel, sections }) {
    const [title, setTitle] = useState(habit?.title || '');
    const [section, setSection] = useState(habit?.section || 'other');
    const [customSection, setCustomSection] = useState('');
    const [type, setType] = useState(habit?.type || 'check');
    const [items, setItems] = useState(habit?.items || []);
    const [newItem, setNewItem] = useState('');
    const [goalTarget, setGoalTarget] = useState(habit?.goal?.target || 0);
    const [goalUnit, setGoalUnit] = useState(habit?.goal?.unit || '');

    const types = [
        { id: 'check', label: 'Simple Check' },
        { id: 'count', label: 'Counter (Water style)' },
        { id: 'multi_check', label: 'Routine (Checklist)' },
        { id: 'time_range', label: 'Sleep/Time Range' }
    ];

    const handleAddItem = () => {
        if (newItem.trim()) {
            setItems([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalSection = section === 'custom' ? customSection : section;

        const habitData = {
            title,
            type,
            section: finalSection,
            items: type === 'multi_check' ? items : undefined,
            goal: type === 'count' ? { target: Number(goalTarget), unit: goalUnit } :
                type === 'time_range' ? { min_duration_minutes: 420 } : undefined
        };

        onSave(habitData);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-secondary uppercase tracking-widest">Title</label>
                <input
                    autoFocus
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Read for 30 mins"
                    className="w-full bg-hover border border-subtle p-3 rounded-lg outline-none focus:border-focus"
                    required
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-secondary uppercase tracking-widest">Section</label>
                <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full bg-hover border border-subtle p-3 rounded-lg outline-none focus:border-focus"
                >
                    {sections.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                    <option value="custom">+ New Section...</option>
                </select>
                {section === 'custom' && (
                    <input
                        type="text"
                        value={customSection}
                        onChange={(e) => setCustomSection(e.target.value)}
                        placeholder="Section Name"
                        className="mt-2 w-full bg-hover border border-subtle p-3 rounded-lg outline-none focus:border-focus"
                        required
                    />
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-secondary uppercase tracking-widest">Type</label>
                <div className="grid grid-cols-2 gap-2">
                    {types.map(t => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setType(t.id)}
                            className={clsx(
                                'p-3 rounded-lg border text-sm text-center transition-all',
                                type === t.id ? 'bg-primary text-black border-primary font-bold' : 'bg-hover border-subtle text-secondary'
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {type === 'count' && (
                <div className="flex gap-3">
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-xs font-semibold text-secondary uppercase tracking-widest">Target</label>
                        <input
                            type="number"
                            value={goalTarget}
                            onChange={(e) => setGoalTarget(e.target.value)}
                            className="w-full bg-hover border border-subtle p-3 rounded-lg outline-none"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-xs font-semibold text-secondary uppercase tracking-widest">Unit</label>
                        <input
                            type="text"
                            value={goalUnit}
                            onChange={(e) => setGoalUnit(e.target.value)}
                            placeholder="e.g. bottles"
                            className="w-full bg-hover border border-subtle p-3 rounded-lg outline-none"
                            required
                        />
                    </div>
                </div>
            )}

            {type === 'multi_check' && (
                <div className="flex flex-col gap-3">
                    <label className="text-xs font-semibold text-secondary uppercase tracking-widest">Routine Steps</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder="Add step..."
                            className="flex-1 bg-hover border border-subtle p-3 rounded-lg outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                        />
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="p-3 bg-hover border border-subtle rounded-lg text-primary"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    <div className="flex flex-col gap-2">
                        {items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between bg-hover/50 p-2 pl-4 rounded-lg border border-subtle/50">
                                <span className="text-sm">{item}</span>
                                <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-dim hover:text-red-500">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-4 flex flex-col gap-3">
                <button
                    type="submit"
                    className="w-full bg-primary text-black font-bold p-4 rounded-xl shadow-lg active:scale-95 transition-all"
                >
                    {habit ? 'Save Changes' : 'Create Habit'}
                </button>

                {habit && (
                    <button
                        type="button"
                        onClick={() => {
                            if (window.confirm('Are you sure you want to delete this habit?')) {
                                onDelete(habit.id);
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 text-red-500 p-3"
                    >
                        <Trash2 size={18} />
                        <span>Delete Habit</span>
                    </button>
                )}
            </div>
        </form>
    );
}
