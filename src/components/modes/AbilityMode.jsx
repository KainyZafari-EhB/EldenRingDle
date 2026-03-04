import React, { useState, useEffect } from 'react';
import { characters } from '../../data/characters';
import { abilities } from '../../data/abilities';
import { getEldenDleDayIndex, getDailyTargetIndex } from '../../hooks/useDaily';
import Search from '../Search';
import SimpleGuessRow from '../SimpleGuessRow';

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
            setHasCompletedToday(true);
            onWin();
        }

        const dataToSave = {
            guesses: newGuesses.map(g => g.id),
            won: won
        };
        localStorage.setItem(`eldenDle_ability_${dayIndex}`, JSON.stringify(dataToSave));
    };

    if (!targetAbility || !targetChar) return <div className="text-elden-gold">Summoning...</div>;
    const isWin = guesses.length > 0 && guesses[0].id === targetChar.id;

    return (
        <div className="w-full max-w-[1200px] flex flex-col items-center">
            <p className="text-gray-300 mb-6 font-medium tracking-widest uppercase text-sm md:text-base opacity-80 border-b border-elden-gold/30 pb-2">
                Guess from the Ability/Spell
            </p>

            <div className="flex flex-col items-center mb-8 bg-[#151515] border border-white/10 p-6 rounded-2xl shadow-xl w-full max-w-sm">
                <div className={`w-32 h-32 md:w-40 md:h-40 ${targetAbility.placeholderColor} rounded-xl border-4 border-elden-gold/70 shadow-[0_0_30px_rgba(198,162,91,0.2)] flex items-center justify-center relative overflow-hidden`}>
                    <span className="text-white/80 font-bold uppercase tracking-widest text-xs rotate-[-45deg] opacity-30 select-none">Placeholder Image</span>
                </div>
                {/* Reveal name of ability after they guess a few times, or immediately if we want? Let's reveal ability name instantly for now */}
                <h3 className="mt-6 text-xl md:text-2xl font-bold text-elden-gold text-center tracking-widest uppercase">
                    {targetAbility.name}
                </h3>
                <p className="text-gray-500 text-sm tracking-widest uppercase mt-1">
                    {targetAbility.type}
                </p>
            </div>

            {!isWin ? (
                <div className="w-full flex flex-col items-center">
                    {!hasCompletedToday && (
                        <Search onGuess={handleGuess} guessedIds={guesses.map(g => g.id)} />
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-6 mb-8 w-full">
                    <div className="text-xl md:text-2xl text-center font-bold text-elden-green px-10 py-5 border-2 border-elden-green rounded-xl bg-gradient-to-r from-[#14532d]/80 to-[#166534]/80 shadow-[0_0_40px_rgba(74,222,128,0.3)] animate-pulse backdrop-blur-sm">
                        Victory! <br /> The user was <span className="text-elden-gold mx-2 text-3xl block mt-2 drop-shadow-md">{targetChar.name}</span>
                    </div>
                    <div className="text-center text-gray-400 font-bold uppercase tracking-widest text-sm bg-black/50 p-4 rounded-lg border border-white/10">
                        <p>Great job! Return tomorrow (at 23:00) for a new challenge.</p>
                        <p className="text-elden-gold mt-2">Try the other modes above!</p>
                    </div>
                </div>
            )}

            <div className="w-full flex flex-col gap-3">
                {guesses.map((g) => (
                    <SimpleGuessRow key={g.id} guess={g} target={targetChar} />
                ))}
            </div>
        </div>
    );
}
