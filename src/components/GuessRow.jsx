import React from 'react';

export default function GuessRow({ guess, target }) {
    const getMatchColor = (guessVal, targetVal, category) => {
        // Check if it's the exact same
        if (guessVal === targetVal) {
            return 'bg-elden-green text-elden-black border-elden-green shadow-[0_0_15px_rgba(74,222,128,0.4)]';
        }

        // Partial matches
        if (category === 'combatStyle' || category === 'weapon') {
            if (
                (guessVal && targetVal && (guessVal.includes(targetVal) || targetVal.includes(guessVal))) ||
                (guessVal === 'Hybrid' && (targetVal === 'Melee' || targetVal === 'Magic' || targetVal === 'Ranged')) ||
                (targetVal === 'Hybrid' && (guessVal === 'Melee' || guessVal === 'Magic' || guessVal === 'Ranged'))
            ) {
                return 'bg-elden-orange text-elden-black border-elden-orange shadow-[0_0_15px_rgba(251,146,60,0.4)]';
            }
        }

        // Default wrong color (Red/Dark Gray)
        return 'bg-elden-red text-white border-elden-red shadow-[0_0_10px_rgba(248,113,113,0.3)]';
    };

    const categories = [
        { key: 'gender', label: 'Gender' },
        { key: 'species', label: 'Species' },
        { key: 'weapon', label: 'Weapon' },
        { key: 'region', label: 'Region' },
        { key: 'combatStyle', label: 'Combat' },
        { key: 'affiliation', label: 'Affiliation' },
        { key: 'release', label: 'Release' },
    ];

    const getInitials = (name) => name.substring(0, 2).toUpperCase();

    return (
        <>
            {/* Desktop: horizontal row (hidden on mobile) */}
            <div className="hidden md:flex gap-2 w-full max-w-[1200px] overflow-x-auto pb-3 snap-x hide-scrollbar scroll-smooth">
                {/* Avatar Tile */}
                <div
                    className="animate-flip-in flex-shrink-0 w-20 h-20 rounded-md border-2 border-elden-gold flex flex-col items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#111] text-elden-gold font-bold text-2xl shadow-[0_4px_10px_rgba(0,0,0,0.5)] snap-start relative overflow-hidden group"
                    style={{ animationDelay: '0ms' }}
                >
                    <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none"></div>
                    {guess.image ? (
                        <img src={guess.image} alt={guess.name} className="w-full h-full object-cover object-top z-0" />
                    ) : (
                        <span className="z-20 relative">{getInitials(guess.name)}</span>
                    )}
                </div>

                {/* Category tiles */}
                {categories.map((cat, idx) => {
                    const colorClass = getMatchColor(guess[cat.key], target[cat.key], cat.key);
                    return (
                        <div
                            key={cat.key}
                            className={`animate-flip-in flex-shrink-0 w-32 h-20 tile ${colorClass} snap-start`}
                            style={{ animationDelay: `${(idx + 1) * 500}ms` }}
                        >
                            {guess[cat.key]}
                        </div>
                    );
                })}
            </div>

            {/* Mobile: compact card layout (hidden on desktop) */}
            <div className="md:hidden w-full pb-3">
                <div className="bg-[#151515] rounded-xl border border-white/10 overflow-hidden">
                    {/* Character header */}
                    <div className="flex items-center gap-3 p-3 border-b border-white/5">
                        <div
                            className="animate-flip-in flex-shrink-0 w-12 h-12 rounded-md border-2 border-elden-gold flex items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#111] text-elden-gold font-bold text-lg shadow-md relative overflow-hidden group"
                            style={{ animationDelay: '0ms' }}
                        >
                            <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none"></div>
                            {guess.image ? (
                                <img src={guess.image} alt={guess.name} className="w-full h-full object-cover object-top z-0" />
                            ) : (
                                <span className="z-20 relative">{getInitials(guess.name)}</span>
                            )}
                        </div>
                        <span className="text-elden-gold font-bold text-base tracking-wide">{guess.name}</span>
                    </div>

                    {/* Attributes grid */}
                    <div className="grid grid-cols-4 gap-[2px] p-[2px]">
                        {categories.map((cat, idx) => {
                            const colorClass = getMatchColor(guess[cat.key], target[cat.key], cat.key);
                            return (
                                <div
                                    key={cat.key}
                                    className={`animate-flip-in flex flex-col items-center justify-center p-1.5 min-h-[52px] text-center rounded-sm ${colorClass}`}
                                    style={{ animationDelay: `${(idx + 1) * 300}ms` }}
                                >
                                    <span className="text-[8px] uppercase tracking-wider opacity-70 font-semibold mb-0.5 leading-tight">{cat.label}</span>
                                    <span className="text-[10px] font-bold leading-tight">{guess[cat.key]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
