import React, { useState, useEffect } from 'react';
import { characters } from '../../data/characters';
import { getEldenDleDayIndex, getDailyTargetIndex } from '../../hooks/useDaily';
import Search from '../Search';
import GuessRow from '../GuessRow';

export default function ClassicMode({ onWin }) {
    const [target, setTarget] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [hasCompletedToday, setHasCompletedToday] = useState(false);
    const [dayIndex, setDayIndex] = useState('');

    useEffect(() => {
        // Calculate the 'day'
        const currentDayIndex = getEldenDleDayIndex();
        setDayIndex(currentDayIndex);

        // Deterministically pick the target based on the day
        // Pass "classic" as the seedModifier so different modes have different answers
        const targetIdx = getDailyTargetIndex(currentDayIndex, "classic", characters.length);
        const dailyTarget = characters[targetIdx];
        setTarget(dailyTarget);

        // Check if user already won this mode today
        const savedData = JSON.parse(localStorage.getItem(`eldenDle_classic_${currentDayIndex}`) || '{"guesses": [], "won": false}');

        if (savedData.guesses.length > 0) {
            // Rehydrate past guesses
            const hydratedGuesses = savedData.guesses.map(id => characters.find(c => c.id === id));
            setGuesses(hydratedGuesses);
            setHasCompletedToday(savedData.won);
        }
    }, []);

    const handleGuess = (char) => {
        const newGuesses = [char, ...guesses];
        setGuesses(newGuesses);

        const won = char.id === target?.id;
        if (won) {
            // Delay the win screen and completion state to allow animations to finish
            // 7 categories * 500ms = 3500ms
            setTimeout(() => {
                setHasCompletedToday(true);
                onWin();
            }, 3500);
        }

        // Save progress for the day
        const dataToSave = {
            guesses: newGuesses.map(g => g.id),
            won: won
        };
        localStorage.setItem(`eldenDle_classic_${dayIndex}`, JSON.stringify(dataToSave));
    };

    if (!target) return <div className="text-elden-gold">Summoning...</div>;
    const isWin = guesses.length > 0 && guesses[0].id === target.id;

    return (
        <div className="w-full max-w-[1200px] flex flex-col items-center">
            <p className="text-gray-300 mb-6 font-medium tracking-widest uppercase text-sm md:text-base opacity-80 border-b border-elden-gold/30 pb-2">
                Guess the Character
            </p>

            {!hasCompletedToday ? (
                <div className="w-full flex flex-col items-center">
                    <div className="flex gap-4 w-full justify-center max-w-md">
                        {/* Hint 1 Logic */}
                        <div className="mb-4 bg-elden-black border border-elden-gold/40 p-3 rounded-lg flex-1 flex flex-col items-center justify-center text-xs tracking-widest uppercase transition-all duration-300">
                            <span className="text-gray-400 mb-1">Hint 1 (Species)</span>
                            {guesses.length >= 3 ? (
                                <span className="text-elden-gold font-bold text-sm animate-[fadeIn_0.5s_ease-out]">{target.species}</span>
                            ) : (
                                <span className="text-gray-500 font-bold text-[10px] mt-1">Unlocks in {3 - guesses.length} guess{3 - guesses.length !== 1 ? 'es' : ''}</span>
                            )}
                        </div>

                        {/* Hint 2 Logic */}
                        <div className="mb-4 bg-elden-black border border-elden-gold/40 p-3 rounded-lg flex-1 flex flex-col items-center justify-center text-xs tracking-widest uppercase transition-all duration-300">
                            <span className="text-gray-400 mb-1">Hint 2 (Region)</span>
                            {guesses.length >= 6 ? (
                                <span className="text-elden-gold font-bold text-sm animate-[fadeIn_0.5s_ease-out]">{target.region}</span>
                            ) : (
                                <span className="text-gray-500 font-bold text-[10px] mt-1">Unlocks in {6 - guesses.length} guess{6 - guesses.length !== 1 ? 'es' : ''}</span>
                            )}
                        </div>
                    </div>

                    {!hasCompletedToday && (
                        <Search onGuess={handleGuess} guessedIds={guesses.map(g => g.id)} />
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-6 mb-8 w-full animate-fade-in">
                    <div className="text-xl md:text-2xl text-center font-bold text-elden-green px-10 py-5 border-2 border-elden-green rounded-xl bg-gradient-to-r from-[#14532d]/80 to-[#166534]/80 shadow-[0_0_40px_rgba(74,222,128,0.3)] animate-pulse backdrop-blur-sm">
                        Victory! <br /> The target was <span className="text-elden-gold mx-2 text-3xl block mt-2 drop-shadow-md">{target.name}</span>
                    </div>
                    <div className="text-center text-gray-400 font-bold uppercase tracking-widest text-sm bg-black/50 p-4 rounded-lg border border-white/10">
                        <p>Great job! Return tomorrow (at 23:00) for a new challenge.</p>
                        <p className="text-elden-gold mt-2">Try the other modes above!</p>
                    </div>
                </div>
            )}

            <div className="w-full flex flex-col gap-3">
                {guesses.length > 0 && (
                    <div className="hidden md:flex gap-2 w-full text-center text-xs uppercase tracking-widest text-[#a1a1aa] font-bold mb-2 pb-2 border-b border-white/5">
                        <div className="w-20 flex-shrink-0">Character</div>
                        <div className="w-32 flex-shrink-0">Gender</div>
                        <div className="w-32 flex-shrink-0">Species</div>
                        <div className="w-32 flex-shrink-0">Weapon</div>
                        <div className="w-32 flex-shrink-0">Region</div>
                        <div className="w-32 flex-shrink-0">Combat</div>
                        <div className="w-32 flex-shrink-0">Affiliation</div>
                        <div className="w-32 flex-shrink-0">Release</div>
                    </div>
                )}
                {guesses.map((g) => (
                    <GuessRow key={g.id} guess={g} target={target} />
                ))}
            </div>
        </div>
    );
}
