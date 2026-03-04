import React from 'react';

export default function SimpleGuessRow({ guess, target }) {
    const isMatch = guess.id === target.id;
    const matchColor = isMatch
        ? 'bg-elden-green text-elden-black border-elden-green shadow-[0_0_15px_rgba(74,222,128,0.4)]'
        : 'bg-elden-red text-white border-elden-red shadow-[0_0_10px_rgba(248,113,113,0.3)]';

    const getInitials = (name) => name.substring(0, 2).toUpperCase();

    return (
        <div className="flex justify-center gap-4 w-full max-w-[400px] mx-auto pb-3">
            {/* Avatar Tile */}
            <div
                className="animate-flip-in flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md border-2 border-elden-gold flex flex-col items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#111] text-elden-gold font-bold text-xl md:text-2xl shadow-[0_4px_10px_rgba(0,0,0,0.5)] relative overflow-hidden group"
                style={{ animationDelay: '0ms' }}
            >
                <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none"></div>
                {guess.image ? (
                    <img src={guess.image} alt={guess.name} className="w-full h-full object-cover object-top z-0" />
                ) : (
                    <span className="z-20 relative">{getInitials(guess.name)}</span>
                )}
            </div>

            {/* Name tile */}
            <div
                className={`animate-flip-in flex-grow max-w-[200px] h-16 md:h-20 tile ${matchColor}`}
                style={{ animationDelay: '300ms' }}
            >
                {guess.name}
            </div>
        </div>
    );
}
