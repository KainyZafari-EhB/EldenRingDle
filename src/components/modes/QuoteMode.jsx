import React, { useState, useEffect, useRef } from 'react';
import { characters } from '../../data/characters';
import { quotes } from '../../data/quotes';
import { getEldenDleDayIndex, getDailyTargetIndex } from '../../hooks/useDaily';
import Search from '../Search';
import SimpleGuessRow from '../SimpleGuessRow';

export default function QuoteMode({ onWin }) {
    const [targetQuote, setTargetQuote] = useState(null);
    const [targetChar, setTargetChar] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [hasCompletedToday, setHasCompletedToday] = useState(false);
    const [dayIndex, setDayIndex] = useState('');
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

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
        localStorage.setItem(`eldenDle_quote_${dayIndex}`, JSON.stringify(dataToSave));
    };

    const toggleAudio = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(err => {
                console.error("Audio file not found. Please ensure you have public/audio/quote_ID.mp3 files.", err);
                alert("Audio file missing! Please place 'quote_" + targetQuote.id + ".mp3' in the public/audio folder.");
            });
            setIsPlaying(true);
        }
    };

    if (!targetQuote || !targetChar) return <div className="text-elden-gold">Summoning...</div>;
    const isWin = guesses.length > 0 && guesses[0].id === targetChar.id;

    const hintsRequired = 3;
    const guessesRemainingForHint = Math.max(0, hintsRequired - guesses.length);
    const isHintUnlocked = guesses.length >= hintsRequired;

    return (
        <div className="w-full max-w-[1200px] flex flex-col items-center">
            <p className="text-gray-300 mb-6 font-medium tracking-widest uppercase text-sm md:text-base opacity-80 border-b border-elden-gold/30 pb-2">
                Guess from the Quote
            </p>

            <div className="bg-[#1a1a1a] border-l-4 border-elden-gold p-6 md:p-10 mb-8 rounded shadow-[0_0_20px_rgba(198,162,91,0.1)] w-full max-w-2xl relative">
                <span className="text-6xl text-elden-gold/20 absolute top-2 left-4 font-serif">"</span>
                <p className="text-xl md:text-3xl text-gray-200 text-center font-serif italic tracking-wide relative z-10 leading-relaxed">
                    {targetQuote.text}
                </p>
            </div>

            {!hasCompletedToday ? (
                <div className="w-full flex flex-col items-center">
                    {!hasCompletedToday && (
                        <>
                            <Search onGuess={handleGuess} guessedIds={guesses.map(g => g.id)} />

                            {/* Audio Hint Section */}
                            <div className="mt-8 flex flex-col items-center bg-[#1a1a1a]/50 px-8 py-4 rounded-xl border border-white/5">
                                {!isHintUnlocked && !isWin && (
                                    <div className="text-gray-500 text-sm font-medium tracking-widest uppercase flex items-center gap-2">
                                        <span>🔒</span>
                                        Audio Hint in <span className="text-elden-gold font-bold">{guessesRemainingForHint}</span> {guessesRemainingForHint === 1 ? 'guess' : 'guesses'}
                                    </div>
                                )}

                                {isHintUnlocked && !isWin && (
                                    <div className="flex flex-col items-center animate-fade-in">
                                        <p className="text-elden-gold text-sm font-bold tracking-widest uppercase mb-3 flex items-center gap-2">
                                            <span>🔊</span> Voice Line Unlocked!
                                        </p>
                                        <button
                                            onClick={toggleAudio}
                                            className="flex items-center gap-2 px-6 py-2 bg-[#111] border border-elden-gold text-elden-gold rounded-full hover:bg-elden-gold hover:text-elden-black transition-colors shadow-[0_0_15px_rgba(198,162,91,0.2)] font-bold uppercase tracking-widest text-sm"
                                        >
                                            <span className="text-lg">{isPlaying ? '⏸️' : '▶️'}</span>
                                            {isPlaying ? 'Playing...' : 'Play Audio'}
                                        </button>
                                        <audio
                                            ref={audioRef}
                                            src={`/audio/quote_${targetQuote.id}.mp3`}
                                            onEnded={() => setIsPlaying(false)}
                                        />
                                        <p className="text-[10px] text-gray-500 mt-3 text-center max-w-[200px]">
                                            Requires 'quote_{targetQuote.id}.mp3' in public/audio/
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-6 mb-8 w-full">
                    <div className="text-xl md:text-2xl text-center font-bold text-elden-green px-10 py-5 border-2 border-elden-green rounded-xl bg-gradient-to-r from-[#14532d]/80 to-[#166534]/80 shadow-[0_0_40px_rgba(74,222,128,0.3)] animate-pulse backdrop-blur-sm">
                        Victory! <br /> The speaker was <span className="text-elden-gold mx-2 text-3xl block mt-2 drop-shadow-md">{targetChar.name}</span>
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
