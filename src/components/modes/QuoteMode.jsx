import React, { useState, useEffect, useMemo } from 'react';
import { characters } from '../../data/characters';
import { quotes } from '../../data/quotes';
import { getEldenDleDayIndex, getDailyTargetIndex, getYesterdayDayIndex } from '../../hooks/useDaily';
import Search from '../Search';
import SimpleGuessRow from '../SimpleGuessRow';
import VictoryCard from '../VictoryCard';

export default function QuoteMode({ onWin }) {
    const [targetQuote, setTargetQuote] = useState(null);
    const [targetChar, setTargetChar] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [hasCompletedToday, setHasCompletedToday] = useState(false);
    const [dayIndex, setDayIndex] = useState('');
    const [revealedHints, setRevealedHints] = useState({});
    const [globalWins, setGlobalWins] = useState(null);

    const yesterdayChampion = useMemo(() => {
        const yesterdayIndex = getYesterdayDayIndex();
        const targetIdx = getDailyTargetIndex(yesterdayIndex, "quote", quotes.length);
        const yesterdayQuote = quotes[targetIdx];
        return characters.find(c => c.id === yesterdayQuote.characterId);
    }, []);

    useEffect(() => {
        const currentDayIndex = getEldenDleDayIndex();
        setDayIndex(currentDayIndex);

        const targetIdx = getDailyTargetIndex(currentDayIndex, "quote", quotes.length);
        const dailyQuote = quotes[targetIdx];

        setTargetQuote(dailyQuote);
        setTargetChar(characters.find(c => c.id === dailyQuote.characterId));

        const savedData = JSON.parse(localStorage.getItem(`eldenDle_quote_${currentDayIndex}`) || '{"guesses": [], "won": false}');

        if (savedData.guesses.length > 0) {
            const hydratedGuesses = savedData.guesses.map(id => characters.find(c => c.id === id));
            setGuesses(hydratedGuesses);
            setHasCompletedToday(savedData.won);
        }

        // Fetch global clear rate
        fetch(`/api/stats?date=${currentDayIndex}&mode=quote`)
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
                fetch(`/api/stats?date=${dayIndex}&mode=quote`, { method: 'POST' })
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
        localStorage.setItem(`eldenDle_quote_${dayIndex}`, JSON.stringify(dataToSave));
    };

    if (!targetQuote || !targetChar) return <div className="text-elden-gold">Summoning...</div>;
    const isWin = guesses.length > 0 && guesses[0].id === targetChar.id;

    // Progressive hint thresholds
    const hint1Threshold = 2;  // Region hint after 2 wrong guesses
    const hint2Threshold = 4;  // Species hint after 4 wrong guesses
    const hint3Threshold = 6;  // Affiliation hint after 6 wrong guesses

    return (
        <div className="w-full max-w-[1200px] flex flex-col items-center">
            <p className="text-gray-300 mb-4 font-medium tracking-widest uppercase text-sm md:text-base opacity-80 border-b border-elden-gold/30 pb-2">
                Guess from the Quote
            </p>

            {globalWins !== null && (
                <div className="mb-6 flex items-center justify-center gap-2 bg-[#151515] border border-elden-gold/20 px-4 py-2 rounded-full shadow-md w-auto">
                    <p className="text-xs md:text-sm font-semibold tracking-wide text-elden-gold/90">
                        {globalWins} Tarnished found the answer today
                    </p>
                </div>
            )}

            <div className="bg-[#1a1a1a] border-l-4 border-elden-gold p-6 md:p-10 mb-6 rounded shadow-[0_0_20px_rgba(198,162,91,0.1)] w-full max-w-2xl relative">
                <span className="text-6xl text-elden-gold/20 absolute top-2 left-4 font-serif">"</span>
                <p className="text-xl md:text-3xl text-gray-200 text-center font-serif italic tracking-wide relative z-10 leading-relaxed">
                    {targetQuote.text}
                </p>
            </div>

            {/* Progressive Hints */}
            {!hasCompletedToday && !isWin && (
                <div className="flex flex-wrap gap-3 justify-center mb-6 w-full max-w-md">
                    {/* Hint 1: Region */}
                    <div
                        className={`bg-[#151515] border border-white/10 px-4 py-2.5 rounded-lg flex flex-col items-center flex-1 min-w-[120px] transition-all duration-300 ${guesses.length >= hint1Threshold && !revealedHints.hint1 ? 'cursor-pointer hover:border-elden-gold/50 hover:bg-white/5' : ''}`}
                        onClick={() => { if (guesses.length >= hint1Threshold && !revealedHints.hint1) setRevealedHints(p => ({ ...p, hint1: true })); }}
                    >
                        <span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold mb-1">Region</span>
                        {guesses.length >= hint1Threshold ? (
                            revealedHints.hint1 ? (
                                <span className="text-elden-gold font-bold text-sm animate-[fadeIn_0.5s_ease-out]">{targetChar.region}</span>
                            ) : (
                                <span className="text-elden-gold/70 font-bold text-[10px]">Click to reveal</span>
                            )
                        ) : (
                            <span className="text-gray-600 text-[10px] font-bold">{hint1Threshold - guesses.length} guess{hint1Threshold - guesses.length !== 1 ? 'es' : ''}</span>
                        )}
                    </div>

                    {/* Hint 2: Species */}
                    <div
                        className={`bg-[#151515] border border-white/10 px-4 py-2.5 rounded-lg flex flex-col items-center flex-1 min-w-[120px] transition-all duration-300 ${guesses.length >= hint2Threshold && !revealedHints.hint2 ? 'cursor-pointer hover:border-elden-gold/50 hover:bg-white/5' : ''}`}
                        onClick={() => { if (guesses.length >= hint2Threshold && !revealedHints.hint2) setRevealedHints(p => ({ ...p, hint2: true })); }}
                    >
                        <span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold mb-1">Species</span>
                        {guesses.length >= hint2Threshold ? (
                            revealedHints.hint2 ? (
                                <span className="text-elden-gold font-bold text-sm animate-[fadeIn_0.5s_ease-out]">{targetChar.species}</span>
                            ) : (
                                <span className="text-elden-gold/70 font-bold text-[10px]">Click to reveal</span>
                            )
                        ) : (
                            <span className="text-gray-600 text-[10px] font-bold">{hint2Threshold - guesses.length} guess{hint2Threshold - guesses.length !== 1 ? 'es' : ''}</span>
                        )}
                    </div>

                    {/* Hint 3: Affiliation */}
                    <div
                        className={`bg-[#151515] border border-white/10 px-4 py-2.5 rounded-lg flex flex-col items-center flex-1 min-w-[120px] transition-all duration-300 ${guesses.length >= hint3Threshold && !revealedHints.hint3 ? 'cursor-pointer hover:border-elden-gold/50 hover:bg-white/5' : ''}`}
                        onClick={() => { if (guesses.length >= hint3Threshold && !revealedHints.hint3) setRevealedHints(p => ({ ...p, hint3: true })); }}
                    >
                        <span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold mb-1">Affiliation</span>
                        {guesses.length >= hint3Threshold ? (
                            revealedHints.hint3 ? (
                                <span className="text-elden-gold font-bold text-sm animate-[fadeIn_0.5s_ease-out]">{targetChar.affiliation}</span>
                            ) : (
                                <span className="text-elden-gold/70 font-bold text-[10px]">Click to reveal</span>
                            )
                        ) : (
                            <span className="text-gray-600 text-[10px] font-bold">{hint3Threshold - guesses.length} guess{hint3Threshold - guesses.length !== 1 ? 'es' : ''}</span>
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
