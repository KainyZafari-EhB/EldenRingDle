import React, { useState, useEffect, useMemo } from 'react';
import { characters } from '../../data/characters';
import { abilities } from '../../data/abilities';
import { getEldenDleDayIndex, getDailyTargetIndex, getYesterdayDayIndex } from '../../hooks/useDaily';
import Search from '../Search';
import SimpleGuessRow from '../SimpleGuessRow';
import VictoryCard from '../VictoryCard';

export default function AbilityMode({ onWin }) {
    const [targetAbility, setTargetAbility] = useState(null);
    const [targetChar, setTargetChar] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [hasCompletedToday, setHasCompletedToday] = useState(false);
    const [dayIndex, setDayIndex] = useState('');
    const [revealedHints, setRevealedHints] = useState({});
    const [globalWins, setGlobalWins] = useState(null);

    const yesterdayChampion = useMemo(() => {
        const yesterdayIndex = getYesterdayDayIndex();
        const targetIdx = getDailyTargetIndex(yesterdayIndex, "ability", abilities.length);
        const yesterdayAbility = abilities[targetIdx];
        return characters.find(c => c.id === yesterdayAbility.characterId);
    }, []);

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

        // Fetch global clear rate
        fetch(`/api/stats?date=${currentDayIndex}&mode=ability`)
            .then(res => res.json())
            .then(data => {
                if (data.count !== undefined) setGlobalWins(data.count);
            })
            .catch(err => console.error("Failed to fetch stats", err));
    }, []);

    const handleGuess = (char) => {
        const newGuesses = [char, ...guesses];
        setGuesses(newGuesses);

        const won = char.id === targetChar?.id;
        if (won) {
            if (!hasCompletedToday) {
                fetch(`/api/stats?date=${dayIndex}&mode=ability`, { method: 'POST' })
                    .then(res => res.json())
                    .then(data => {
                        if (data.count !== undefined) setGlobalWins(data.count);
                    })
                    .catch(e => console.error(e));
            }
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
            <p className="text-gray-300 mb-4 font-medium tracking-widest uppercase text-sm md:text-base opacity-80 border-b border-elden-gold/30 pb-2">
                Guess from the Ability/Spell
            </p>

            {globalWins !== null && (
                <div className="mb-6 flex items-center justify-center gap-2 bg-[#151515] border border-elden-gold/20 px-4 py-2 rounded-full shadow-md w-auto">
                    <p className="text-xs md:text-sm font-semibold tracking-wide text-elden-gold/90">
                        {globalWins} Tarnished found the answer today
                    </p>
                </div>
            )}

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

            {/* Progressive Hints */}
            {!hasCompletedToday && !isWin && (
                <div className="flex flex-wrap gap-3 justify-center mb-6 w-full max-w-sm">
                    <div
                        className={`bg-[#151515] border border-white/10 px-4 py-2.5 rounded-lg flex flex-col items-center flex-1 min-w-[120px] transition-all duration-300 ${guesses.length >= 2 && !revealedHints.hint1 ? 'cursor-pointer hover:border-elden-gold/50 hover:bg-white/5' : ''}`}
                        onClick={() => { if (guesses.length >= 2 && !revealedHints.hint1) setRevealedHints(p => ({ ...p, hint1: true })); }}
                    >
                        <span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold mb-1">Region</span>
                        {guesses.length >= 2 ? (
                            revealedHints.hint1 ? (
                                <span className="text-elden-gold font-bold text-sm">{targetChar.region}</span>
                            ) : (
                                <span className="text-elden-gold/70 font-bold text-[10px]">Click to reveal</span>
                            )
                        ) : (
                            <span className="text-gray-600 text-[10px] font-bold">{2 - guesses.length} guess{2 - guesses.length !== 1 ? 'es' : ''}</span>
                        )}
                    </div>
                    <div
                        className={`bg-[#151515] border border-white/10 px-4 py-2.5 rounded-lg flex flex-col items-center flex-1 min-w-[120px] transition-all duration-300 ${guesses.length >= 4 && !revealedHints.hint2 ? 'cursor-pointer hover:border-elden-gold/50 hover:bg-white/5' : ''}`}
                        onClick={() => { if (guesses.length >= 4 && !revealedHints.hint2) setRevealedHints(p => ({ ...p, hint2: true })); }}
                    >
                        <span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold mb-1">Species</span>
                        {guesses.length >= 4 ? (
                            revealedHints.hint2 ? (
                                <span className="text-elden-gold font-bold text-sm">{targetChar.species}</span>
                            ) : (
                                <span className="text-elden-gold/70 font-bold text-[10px]">Click to reveal</span>
                            )
                        ) : (
                            <span className="text-gray-600 text-[10px] font-bold">{4 - guesses.length} guess{4 - guesses.length !== 1 ? 'es' : ''}</span>
                        )}
                    </div>
                </div>
            )}

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
