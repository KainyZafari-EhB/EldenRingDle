import React, { useState, useEffect } from 'react';
import { characters } from '../../data/characters';
import { abilities } from '../../data/abilities';
import { getEldenDleDayIndex, getDailyTargetIndex } from '../../hooks/useDaily';
import Search from '../Search';
import SimpleGuessRow from '../SimpleGuessRow';
import VictoryCard from '../VictoryCard';

export default function AbilityMode({ onWin }) {
    const [targetAbility, setTargetAbility] = useState(null);
    const [targetChar, setTargetChar] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [hasCompletedToday, setHasCompletedToday] = useState(false);
    const [dayIndex, setDayIndex] = useState('');

    useEffect(() => {
        const currentDayIndex = getEldenDleDayIndex();
        setDayIndex(currentDayIndex);

        const targetIdx = getDailyTargetIndex(currentDayIndex, "ability", abilities.length);
        const dailyAbility = abilities[targetIdx];

        setTargetAbility(dailyAbility);
        setTargetChar(characters.find(c => c.id === dailyAbility.characterId));

        const savedData = JSON.parse(localStorage.getItem(`eldenDle_ability_${currentDayIndex}`) || '{"guesses": [], "won": false}');

        if (savedData.guesses.length > 0) {
            const hydratedGuesses = savedData.guesses.map(id => characters.find(c => c.id === id));
            setGuesses(hydratedGuesses);
            setHasCompletedToday(savedData.won);
        }
    }, []);

    const handleGuess = (char) => {
        const newGuesses = [char, ...guesses];
        setGuesses(newGuesses);

        const won = char.id === targetChar?.id;
        if (won) {
            setTimeout(() => {
                setHasCompletedToday(true);
                onWin();
            }, 1000);
        }

        const dataToSave = {
            guesses: newGuesses.map(g => g.id),
            won: won
        };
        localStorage.setItem(`eldenDle_ability_${dayIndex}`, JSON.stringify(dataToSave));
    };

    if (!targetAbility || !targetChar) return <div className="text-elden-gold">Summoning...</div>;
    const isWin = guesses.length > 0 && guesses[0].id === targetChar.id;

    // Simple accent color based on type
    const typeColors = {
        Skill: { accent: 'border-amber-600/40', text: 'text-amber-400', bg: 'bg-amber-500/5' },
        Sorcery: { accent: 'border-cyan-500/40', text: 'text-cyan-400', bg: 'bg-cyan-500/5' },
        Incantation: { accent: 'border-orange-500/40', text: 'text-orange-400', bg: 'bg-orange-500/5' },
    };
    const colors = typeColors[targetAbility.type] || typeColors.Skill;

    return (
        <div className="w-full max-w-[1200px] flex flex-col items-center">
            <p className="text-gray-300 mb-6 font-medium tracking-widest uppercase text-sm md:text-base opacity-80 border-b border-elden-gold/30 pb-2">
                Guess from the Ability/Spell
            </p>

            {/* Ability card — clean, minimal design */}
            <div className={`flex flex-col items-center mb-8 ${colors.bg} border ${colors.accent} p-6 md:p-8 rounded-2xl w-full max-w-sm`}>
                {/* Type label */}
                <span className={`text-[10px] md:text-xs ${colors.text} uppercase tracking-[0.25em] font-semibold mb-4 opacity-70`}>
                    {targetAbility.type}
                </span>

                {/* Ability name */}
                <h3 className="text-xl md:text-2xl font-bold text-elden-gold text-center tracking-widest uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
                    {targetAbility.name}
                </h3>

                {/* Thin divider */}
                <div className="w-12 h-[1px] bg-elden-gold/30 mt-4 mb-3"></div>

                {/* Hint text */}
                <p className="text-gray-500 text-xs tracking-widest uppercase">
                    Who uses this {targetAbility.type.toLowerCase()}?
                </p>
            </div>

            {!hasCompletedToday ? (
                <div className="w-full flex flex-col items-center">
                    {!hasCompletedToday && (
                        <Search onGuess={handleGuess} guessedIds={guesses.map(g => g.id)} />
                    )}
                </div>
            ) : (
                <VictoryCard characterName={targetChar.name} characterImage={targetChar.image} />
            )}

            <div className="w-full flex flex-col gap-3">
                {guesses.map((g) => (
                    <SimpleGuessRow key={g.id} guess={g} target={targetChar} />
                ))}
            </div>
        </div>
    );
}
