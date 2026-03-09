import React, { useState, useEffect, useMemo } from 'react';
import { characters } from '../../data/characters';
import { getEldenDleDayIndex, getDailyTargetIndex, getYesterdayDayIndex } from '../../hooks/useDaily';
import Search from '../Search';
import GuessRow from '../GuessRow';
import VictoryCard from '../VictoryCard';

export default function ClassicMode({ onWin }) {
    const [target, setTarget] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [hasCompletedToday, setHasCompletedToday] = useState(false);
    const [dayIndex, setDayIndex] = useState('');
    const [revealedHints, setRevealedHints] = useState({});

    const yesterdayChampion = useMemo(() => {
        const yesterdayIndex = getYesterdayDayIndex();
        const targetIdx = getDailyTargetIndex(yesterdayIndex, "classic", characters.length);
        return characters[targetIdx];
    }, []);

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
                        <div
                            className={`mb-4 bg-elden-black border border-elden-gold/40 p-3 rounded-lg flex-1 flex flex-col items-center justify-center text-xs tracking-widest uppercase transition-all duration-300 ${guesses.length >= 3 && !revealedHints.hint1 ? 'cursor-pointer hover:border-elden-gold hover:bg-elden-gold/5' : ''}`}
                            onClick={() => { if (guesses.length >= 3 && !revealedHints.hint1) setRevealedHints(p => ({ ...p, hint1: true })); }}
                        >
                            <span className="text-gray-400 mb-1">Hint 1 (Species)</span>
                            {guesses.length >= 3 ? (
                                revealedHints.hint1 ? (
                                    <span className="text-elden-gold font-bold text-sm animate-[fadeIn_0.5s_ease-out]">{target.species}</span>
                                ) : (
                                    <span className="text-elden-gold/70 font-bold text-[10px] mt-1">Click to reveal</span>
                                )
                            ) : (
                                <span className="text-gray-500 font-bold text-[10px] mt-1">Unlocks in {3 - guesses.length} guess{3 - guesses.length !== 1 ? 'es' : ''}</span>
                            )}
                        </div>

                        {/* Hint 2 Logic */}
                        <div
                            className={`mb-4 bg-elden-black border border-elden-gold/40 p-3 rounded-lg flex-1 flex flex-col items-center justify-center text-xs tracking-widest uppercase transition-all duration-300 ${guesses.length >= 6 && !revealedHints.hint2 ? 'cursor-pointer hover:border-elden-gold hover:bg-elden-gold/5' : ''}`}
                            onClick={() => { if (guesses.length >= 6 && !revealedHints.hint2) setRevealedHints(p => ({ ...p, hint2: true })); }}
                        >
                            <span className="text-gray-400 mb-1">Hint 2 (Region)</span>
                            {guesses.length >= 6 ? (
                                revealedHints.hint2 ? (
                                    <span className="text-elden-gold font-bold text-sm animate-[fadeIn_0.5s_ease-out]">{target.region}</span>
                                ) : (
                                    <span className="text-elden-gold/70 font-bold text-[10px] mt-1">Click to reveal</span>
                                )
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
                <VictoryCard characterName={target.name} characterImage={target.image} />
            )}

            <div className="w-full flex flex-col gap-3">
                {guesses.length > 0 && (
                    <div className="hidden md:flex gap-2 w-full text-center text-xs uppercase tracking-widest text-[#a1a1aa] font-bold mb-2 pb-2 border-b border-white/5">
                        <div className="w-20 flex-shrink-0">Character</div>
                        <div className="w-32 flex-shrink-0">Gender</div>
                        <div className="w-32 flex-shrink-0">Species</div>
                        <div className="w-32 flex-shrink-0">Weapon</div>
                        <div className="w-32 flex-shrink-0">Region</div>
                        <div className="w-32 flex-shrink-0">Runes</div>
                        <div className="w-32 flex-shrink-0">Affiliation</div>
                        <div className="w-32 flex-shrink-0">Release</div>
                    </div>
                )}
                {guesses.map((g) => (
                    <GuessRow key={g.id} guess={g} target={target} />
                ))}
            </div>

            {/* Yesterday's Champion */}
            <div className="mt-8 mb-4 text-center w-full">
                <p className="text-gray-500 text-xs uppercase tracking-widest">
                    Yesterday's champion was{' '}
                    <span className="text-elden-gold font-bold">{yesterdayChampion?.name}</span>
                </p>
            </div>
        </div>
    );
}
