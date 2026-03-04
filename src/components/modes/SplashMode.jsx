import React, { useState, useEffect } from 'react';
import { characters } from '../../data/characters';
import { splashes } from '../../data/splashes';
import { getEldenDleDayIndex, getDailyTargetIndex } from '../../hooks/useDaily';
import Search from '../Search';
import SimpleGuessRow from '../SimpleGuessRow';

export default function SplashMode({ onWin }) {
    const [targetSplash, setTargetSplash] = useState(null);
    const [targetChar, setTargetChar] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [hasCompletedToday, setHasCompletedToday] = useState(false);
    const [dayIndex, setDayIndex] = useState('');

    useEffect(() => {
        const currentDayIndex = getEldenDleDayIndex();
        setDayIndex(currentDayIndex);

        const targetIdx = getDailyTargetIndex(currentDayIndex, "splash", splashes.length);
        const dailySplash = splashes[targetIdx];

        setTargetSplash(dailySplash);
        setTargetChar(characters.find(c => c.id === dailySplash.characterId));

        const savedData = JSON.parse(localStorage.getItem(`eldenDle_splash_${currentDayIndex}`) || '{"guesses": [], "won": false}');

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
            }, 1500);
        }

        const dataToSave = {
            guesses: newGuesses.map(g => g.id),
            won: won
        };
        localStorage.setItem(`eldenDle_splash_${dayIndex}`, JSON.stringify(dataToSave));
    };

    if (!targetSplash || !targetChar) return <div className="text-elden-gold">Summoning...</div>;
    const isWin = guesses.length > 0 && guesses[0].id === targetChar.id;

    // Calculate zoom level based on number of guesses. 
    // Start super zoomed in (e.g. scale 400%), and zoom out slightly with each wrong guess.
    const zoomLevel = Math.max(100, 400 - (guesses.length * 40));
    const blurLevel = Math.max(0, 10 - (guesses.length * 2));

    return (
        <div className="w-full max-w-[1200px] flex flex-col items-center">
            <p className="text-gray-300 mb-6 font-medium tracking-widest uppercase text-sm md:text-base opacity-80 border-b border-elden-gold/30 pb-2">
                Guess from the Splash Art
            </p>

            <div className="flex flex-col items-center mb-8 bg-[#151515] border border-white/10 p-4 rounded-2xl shadow-xl w-full max-w-lg relative">
                <div className="w-full aspect-video rounded-xl bg-[#111] overflow-hidden relative border-2 border-elden-gold/50 shadow-inner flex flex-col justify-center items-center">
                    {/* Placeholder for actual cropped image */}
                    {targetChar.image ? (
                        <div
                            className="w-full h-full absolute inset-0 bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
                            style={{
                                backgroundImage: `url(${targetChar.image})`,
                                backgroundSize: `${zoomLevel}%`,
                                filter: isWin ? 'none' : `blur(${blurLevel}px)`
                            }}
                        />
                    ) : (
                        <div className={`w-full h-full absolute inset-0 transition-all duration-1000 ease-in-out ${targetSplash.placeholderColor}`}
                            style={{
                                transform: `scale(${zoomLevel / 100})`,
                                filter: isWin ? 'none' : `blur(${blurLevel}px)`
                            }}
                        >
                            <div className="w-full h-full flex items-center justify-center opacity-30 text-white font-bold text-center tracking-widest uppercase rotate-[-20deg]">
                                Zoomed Image Placeholder <br /> {targetSplash.hint}
                            </div>
                        </div>
                    )}

                    {/* Dark overlay that fades as they guess more */}
                    {!isWin && (
                        <div
                            className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-1000"
                            style={{ opacity: Math.max(0, 0.7 - (guesses.length * 0.1)) }}
                        ></div>
                    )}
                </div>

                <p className="mt-4 text-xs text-elden-gold/60 uppercase tracking-widest font-bold">
                    {isWin ? 'Full Image Revealed!' : 'Image zooms out & unblurs with every guess'}
                </p>
            </div>

            {!hasCompletedToday ? (
                <div className="w-full flex flex-col items-center">
                    {!hasCompletedToday && (
                        <Search onGuess={handleGuess} guessedIds={guesses.map(g => g.id)} />
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-6 mb-8 w-full">
                    <div className="text-xl md:text-2xl text-center font-bold text-elden-green px-10 py-5 border-2 border-elden-green rounded-xl bg-gradient-to-r from-[#14532d]/80 to-[#166534]/80 shadow-[0_0_40px_rgba(74,222,128,0.3)] animate-pulse backdrop-blur-sm">
                        Victory! <br /> The character was <span className="text-elden-gold mx-2 text-3xl block mt-2 drop-shadow-md">{targetChar.name}</span>
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
