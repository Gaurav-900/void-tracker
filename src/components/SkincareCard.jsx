import { clsx } from 'clsx';
import { Sun, Moon, Check } from 'lucide-react';

export function SkincareCard({ habit, log, onUpdate }) {
    const items = habit.items || ['AM Routine', 'PM Routine'];
    const checkedItems = log?.checked_items || [];

    const isAllChecked = items.every(item => checkedItems.includes(item));

    const toggleItem = (e, item) => {
        e.stopPropagation();
        const newChecked = checkedItems.includes(item)
            ? checkedItems.filter(i => i !== item)
            : [...checkedItems, item];

        const status = newChecked.length === items.length ? 'completed' : 'pending';

        onUpdate({
            checked_items: newChecked,
            status
        });
    };

    return (
        <div className={clsx('tracker-card skincare-card', isAllChecked && 'completed')}>
            <div className="card-content flex flex-col justify-center w-full gap-2 py-3">
                <div className="flex items-center gap-3">
                    <div className={clsx('icon-box', isAllChecked ? 'bg-green' : 'bg-purple')}>
                        {isAllChecked ? <Check size={18} /> : <Moon size={18} className="text-purple-400" />}
                    </div>
                    <span className="text-base font-medium">{habit.title}</span>
                </div>

                <div className="sub-items flex gap-2 mt-1 pl-[48px]">
                    {items.map(item => {
                        const isChecked = checkedItems.includes(item);
                        const isAM = item.includes('AM');

                        return (
                            <button
                                key={item}
                                onClick={(e) => toggleItem(e, item)}
                                className={clsx('chip', isChecked && 'active')}
                                aria-label={`Toggle ${item}`}
                                aria-pressed={isChecked}
                            >
                                {isAM ? <Sun size={12} className="mr-1" /> : <Moon size={12} className="mr-1" />}
                                {item}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
