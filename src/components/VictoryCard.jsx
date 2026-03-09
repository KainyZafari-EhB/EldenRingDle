import React from 'react';
import CountdownTimer from './CountdownTimer';

export default function VictoryCard({ characterName, characterImage }) {
    return (
        <div className="flex flex-col items-center mb-6 w-full">
            {/* Character image + name */}
            <div className="flex items-center gap-3 mb-2">
                {characterImage && (
                    <img
                        src={characterImage}
                        alt={characterName}
                        className="w-12 h-12 rounded-full object-cover object-top border-2 border-elden-green"
                    />
                )}
                <span className="text-elden-gold text-xl font-bold">{characterName}</span>
                <span className="text-elden-green text-sm">✓</span>
            </div>
            <p className="text-gray-600 text-[11px] tracking-wide">
                Next puzzle in <CountdownTimer className="text-elden-gold font-bold" />
            </p>
        </div>
    );
}
