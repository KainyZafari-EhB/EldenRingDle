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
        // LoLdle typically uses a red background for wrong
        return 'bg-elden-red text-white border-elden-red shadow-[0_0_10px_rgba(248,113,113,0.3)]';
    };

    const categories = ['gender', 'species', 'weapon', 'region', 'combatStyle', 'affiliation', 'release'];

    // Using initials as an avatar placeholder since real images are missing
    const getInitials = (name) => name.substring(0, 2).toUpperCase();

    return (
        <div className="flex gap-2 w-full max-w-[1200px] overflow-x-auto pb-3 snap-x hide-scrollbar scroll-smooth">
            {/* Avatar Tile */}
            <div
                className="animate-flip-in flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md border-2 border-elden-gold flex flex-col items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#111] text-elden-gold font-bold text-xl md:text-2xl shadow-[0_4px_10px_rgba(0,0,0,0.5)] snap-start relative overflow-hidden group"
                style={{ animationDelay: '0ms' }}
            >
                <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none"></div>
                {guess.image ? (
                    <img src={guess.image} alt={guess.name} className="w-full h-full object-cover object-top z-0" />
                ) : (
                    <span className="z-20 relative">{getInitials(guess.name)}</span>
                )}
            </div>

            {/* Specific Gender Tile as requested */}
            <div
                className={`animate-flip-in flex-shrink-0 w-24 md:w-32 h-16 md:h-20 tile ${getMatchColor(guess.gender, target.gender, 'gender')} snap-start`}
                style={{ animationDelay: '500ms' }}
            >
                {guess.gender}
            </div>

            {/* Other Categories */}
            {categories.filter(cat => cat !== 'gender').map((cat, idx) => {
                const colorClass = getMatchColor(guess[cat], target[cat], cat);
                return (
                    <div
                        key={cat}
                        className={`animate-flip-in flex-shrink-0 w-24 md:w-32 h-16 md:h-20 tile ${colorClass} snap-start`}
                        style={{ animationDelay: `${(idx + 2) * 500}ms` }}
                    >
                        {guess[cat]}
                    </div>
                );
            })}
        </div>
    );
}
