import { clsx } from 'clsx';
import { LayoutGrid, Calendar, Settings } from 'lucide-react';

export function Layout({ children, activeTab, onTabChange }) {
    return (
        <div className="container">
            <main className="main-content">
                {children}
            </main>
            <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
        </div>
    );
}

function BottomNav({ activeTab, onTabChange }) {
    const tabs = [
        { id: 'today', icon: LayoutGrid, label: 'Today' },
        { id: 'stats', icon: Calendar, label: 'Stats' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <nav className="bottom-nav">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={clsx('nav-item', isActive && 'active')}
                    >
                        <Icon className="icon" />
                        <span className="nav-label">{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
