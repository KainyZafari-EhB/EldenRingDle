import React, { useState, useEffect } from 'react';
import CountdownTimer from './CountdownTimer';
import { getEldenDleDayIndex } from '../hooks/useDaily';
import Navigation from './Navigation';
import ClassicMode from './modes/ClassicMode';
import QuoteMode from './modes/QuoteMode';
import AbilityMode from './modes/AbilityMode';
import SplashMode from './modes/SplashMode';

// --- Inline SVG Icon Components ---
const IconSword = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
        <path d="M13 19l6-6" />
        <path d="M16 16l4 4" />
        <path d="M19 21l2-2" />
        <path d="M14.5 6.5L18 3h3v3l-3.5 3.5" />
    </svg>
);

const IconScroll = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 21h12a2 2 0 002-2v-1a2 2 0 00-2-2H6" />
        <path d="M8 21a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2v1" />
        <path d="M4 19a2 2 0 01-2-2V7a2 2 0 012-2" />
        <line x1="10" y1="8" x2="18" y2="8" />
        <line x1="10" y1="12" x2="16" y2="12" />
    </svg>
);

const IconFlame = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c-4.97 0-7-3.58-7-7 0-3.07 2.17-6.17 4-7.83C10.7 5.6 12 3 12 2c0 0 2.5 2.1 4.5 5.17C18.5 10.24 19 12.5 19 15c0 3.42-2.03 7-7 7z" />
        <path d="M10 15.5c0 1.38.62 2.5 2 2.5s2-1.12 2-2.5c0-1.5-2-4-2-4s-2 2.5-2 4z" />
    </svg>
);

const IconEye = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const IconTrophy = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4a2 2 0 01-2-2V5h4" />
        <path d="M18 9h2a2 2 0 002-2V5h-4" />
        <path d="M4 5h16v4a6 6 0 01-6 6h-4a6 6 0 01-6-6V5z" />
        <path d="M10 15v2" />
        <path d="M14 15v2" />
        <path d="M7 19h10" />
    </svg>
);

// Accent colors for each mode card (left border bar)
const MODE_ACCENTS = {
    classic: 'border-l-amber-500',
    quote: 'border-l-teal-500',
    ability: 'border-l-orange-400',
    splash: 'border-l-indigo-400',
};

export default function EldenDle() {
    const [currentMode, setCurrentMode] = useState('home');
    const [showSummary, setShowSummary] = useState(false);
    const [dailyCompletion, setDailyCompletion] = useState({
        classic: null,
        quote: null,
        ability: null,
        splash: null
    });

    // Check completion status on mount and when modes finish
    const checkCompletion = () => {
        const currentDayIndex = getEldenDleDayIndex();

        const classicData = JSON.parse(localStorage.getItem(`eldenDle_classic_${currentDayIndex}`) || '{"won": false, "guesses": []}');
        const quoteData = JSON.parse(localStorage.getItem(`eldenDle_quote_${currentDayIndex}`) || '{"won": false, "guesses": []}');
        const abilityData = JSON.parse(localStorage.getItem(`eldenDle_ability_${currentDayIndex}`) || '{"won": false, "guesses": []}');
        const splashData = JSON.parse(localStorage.getItem(`eldenDle_splash_${currentDayIndex}`) || '{"won": false, "guesses": []}');

        const newCompletion = {
            classic: classicData.won ? classicData.guesses.length : null,
            quote: quoteData.won ? quoteData.guesses.length : null,
            ability: abilityData.won ? abilityData.guesses.length : null,
            splash: splashData.won ? splashData.guesses.length : null
        };

        setDailyCompletion(newCompletion);

        // Auto-show summary if they just finished the last run and haven't seen it yet
        // A simple way to do this is check if all are completed and we're just hitting it now
        if (Object.values(newCompletion).every(val => val !== null)) {
            // We only enforce showing it initially, user can close it later
            if (!sessionStorage.getItem('eldenDleSummaryShown')) {
                setShowSummary(true);
                sessionStorage.setItem('eldenDleSummaryShown', 'true');
            }
        }
    };

    useEffect(() => {
        checkCompletion();
    }, []);

    const handleWin = () => {
        checkCompletion();
    };

    const allCompleted = Object.values(dailyCompletion).every(val => val !== null);

    return (
        <div className="min-h-screen w-full flex flex-col items-center p-4 md:p-8 font-sans relative">

            {/* Top Bar for Stats if completed */}
            {allCompleted && (
                <div className="w-full max-w-[1200px] flex justify-end mb-4 px-4">
                    <button
                        onClick={() => setShowSummary(true)}
                        className="bg-elden-gold/20 hover:bg-elden-gold/40 text-elden-gold border border-elden-gold rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_10px_rgba(198,162,91,0.2)] flex items-center gap-2"
                    >
                        <IconTrophy className="w-4 h-4" /> View Daily Stats
                    </button>
                </div>
            )}

            {/* Logo */}
            <div className="flex flex-col items-center mt-2 text-center mb-8">
                <h1
                    className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-[#fcd34d] via-[#eeb317] to-[#b45309] drop-shadow-[0_4px_10px_rgba(180,83,9,0.5)] tracking-widest uppercase mb-2"
                    style={{ fontFamily: "'Cinzel', serif" }}
                >
                    Elden-Dle
                </h1>
            </div>

            {/* Navigation Menu */}
            {currentMode !== 'home' && (
                <Navigation currentMode={currentMode} setMode={setCurrentMode} />
            )}

            {/* Active Mode */}
            <div className="w-full flex-grow flex flex-col items-center">
                {currentMode === 'home' && (
                    <div className="flex flex-col items-center w-full max-w-lg mt-4 md:mt-8 animate-fade-in px-2 md:px-4">
                        <h2 className="text-xl md:text-2xl text-elden-gold font-bold uppercase tracking-widest mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center">
                            Select Your Trial
                        </h2>

                        <div className="flex flex-col gap-3 w-full">

                            {/* Classic Mode Card */}
                            <div
                                onClick={() => setCurrentMode('classic')}
                                className={`bg-[#111]/80 backdrop-blur-sm border-2 border-elden-gold/40 hover:border-elden-gold rounded-xl p-3 md:p-4 cursor-pointer transform hover:-translate-y-1 transition-all duration-300 shadow-[0_0_15px_rgba(198,162,91,0.1)] hover:shadow-[0_0_20px_rgba(198,162,91,0.3)] group flex items-center justify-between text-left gap-4 relative overflow-hidden border-l-4 ${MODE_ACCENTS.classic}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-elden-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="flex items-center gap-4 z-10 w-full overflow-hidden">
                                    <span className="text-elden-gold min-w-[3rem] text-center drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                                        <IconSword className="w-8 h-8 mx-auto" />
                                    </span>
                                    <div className="flex flex-col min-w-0 flex-grow pr-2">
                                        <h3 className="text-lg md:text-xl text-white font-bold tracking-widest uppercase mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Classic</h3>
                                        <p className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">Guess the character from their attributes</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quote Mode Card */}
                            <div
                                onClick={() => setCurrentMode('quote')}
                                className={`bg-[#111]/80 backdrop-blur-sm border-2 border-elden-gold/40 hover:border-elden-gold rounded-xl p-3 md:p-4 cursor-pointer transform hover:-translate-y-1 transition-all duration-300 shadow-[0_0_15px_rgba(198,162,91,0.1)] hover:shadow-[0_0_20px_rgba(198,162,91,0.3)] group flex items-center justify-between text-left gap-4 relative overflow-hidden border-l-4 ${MODE_ACCENTS.quote}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-elden-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="flex items-center gap-4 z-10 w-full overflow-hidden">
                                    <span className="text-elden-gold min-w-[3rem] text-center drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                                        <IconScroll className="w-8 h-8 mx-auto" />
                                    </span>
                                    <div className="flex flex-col min-w-0 flex-grow pr-2">
                                        <h3 className="text-lg md:text-xl text-white font-bold tracking-widest uppercase mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Quote</h3>
                                        <p className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">Guess the character from a voice line</p>
                                    </div>
                                </div>
                            </div>

                            {/* Ability Mode Card */}
                            <div
                                onClick={() => setCurrentMode('ability')}
                                className={`bg-[#111]/80 backdrop-blur-sm border-2 border-elden-gold/40 hover:border-elden-gold rounded-xl p-3 md:p-4 cursor-pointer transform hover:-translate-y-1 transition-all duration-300 shadow-[0_0_15px_rgba(198,162,91,0.1)] hover:shadow-[0_0_20px_rgba(198,162,91,0.3)] group flex items-center justify-between text-left gap-4 relative overflow-hidden border-l-4 ${MODE_ACCENTS.ability}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-elden-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="flex items-center gap-4 z-10 w-full overflow-hidden">
                                    <span className="text-elden-gold min-w-[3rem] text-center drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                                        <IconFlame className="w-8 h-8 mx-auto" />
                                    </span>
                                    <div className="flex flex-col min-w-0 flex-grow pr-2">
                                        <h3 className="text-lg md:text-xl text-white font-bold tracking-widest uppercase mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Ability</h3>
                                        <p className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">Guess the character from their spell/skill</p>
                                    </div>
                                </div>
                            </div>

                            {/* Splash Mode Card */}
                            <div
                                onClick={() => setCurrentMode('splash')}
                                className={`bg-[#111]/80 backdrop-blur-sm border-2 border-elden-gold/40 hover:border-elden-gold rounded-xl p-3 md:p-4 cursor-pointer transform hover:-translate-y-1 transition-all duration-300 shadow-[0_0_15px_rgba(198,162,91,0.1)] hover:shadow-[0_0_20px_rgba(198,162,91,0.3)] group flex items-center justify-between text-left gap-4 relative overflow-hidden border-l-4 ${MODE_ACCENTS.splash}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-elden-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="flex items-center gap-4 z-10 w-full overflow-hidden">
                                    <span className="text-elden-gold min-w-[3rem] text-center drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                                        <IconEye className="w-8 h-8 mx-auto" />
                                    </span>
                                    <div className="flex flex-col min-w-0 flex-grow pr-2">
                                        <h3 className="text-lg md:text-xl text-white font-bold tracking-widest uppercase mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Splash</h3>
                                        <p className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">Guess from a zoomed-in image</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentMode === 'classic' && <ClassicMode onWin={handleWin} />}
                {currentMode === 'quote' && <QuoteMode onWin={handleWin} />}
                {currentMode === 'ability' && <AbilityMode onWin={handleWin} />}
                {currentMode === 'splash' && <SplashMode onWin={handleWin} />}
            </div>

            {/* Summary Modal Popup */}
            {showSummary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
                    <div className="w-full max-w-lg bg-[#111] border-2 border-elden-gold/50 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(198,162,91,0.3)] animate-flip-in relative flex flex-col items-center">

                        <button
                            onClick={() => setShowSummary(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl leading-none transition-colors"
                        >
                            &times;
                        </button>

                        <h2 className="text-2xl md:text-3xl text-elden-gold font-bold uppercase tracking-widest mb-4 drop-shadow-md text-center">Daily Summary</h2>
                        <p className="text-gray-300 text-xs md:text-sm tracking-widest uppercase mb-8 border-b border-elden-gold/30 pb-4 text-center w-full">
                            You have vanquished today's challenges. Here are your stats:
                        </p>

                        <div className="w-full flex flex-col gap-3 md:gap-4 text-gray-200">
                            <div className="flex justify-between items-center bg-[#1a1a1a] p-3 md:p-4 rounded-xl border border-white/10">
                                <span className="font-bold uppercase tracking-widest flex items-center gap-3 text-xs md:text-sm"><span className="text-elden-gold"><IconSword className="w-5 h-5 md:w-6 md:h-6" /></span> Classic Mode</span>
                                <span className="text-elden-green font-bold bg-[#14532d] px-2 py-1 text-xs md:text-sm rounded-md border border-elden-green/30">{dailyCompletion.classic || '-'} Guesses</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#1a1a1a] p-3 md:p-4 rounded-xl border border-white/10">
                                <span className="font-bold uppercase tracking-widest flex items-center gap-3 text-xs md:text-sm"><span className="text-elden-gold"><IconScroll className="w-5 h-5 md:w-6 md:h-6" /></span> Quote Mode</span>
                                <span className="text-elden-green font-bold bg-[#14532d] px-2 py-1 text-xs md:text-sm rounded-md border border-elden-green/30">{dailyCompletion.quote || '-'} Guesses</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#1a1a1a] p-3 md:p-4 rounded-xl border border-white/10">
                                <span className="font-bold uppercase tracking-widest flex items-center gap-3 text-xs md:text-sm"><span className="text-elden-gold"><IconFlame className="w-5 h-5 md:w-6 md:h-6" /></span> Ability Mode</span>
                                <span className="text-elden-green font-bold bg-[#14532d] px-2 py-1 text-xs md:text-sm rounded-md border border-elden-green/30">{dailyCompletion.ability || '-'} Guesses</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#1a1a1a] p-3 md:p-4 rounded-xl border border-white/10">
                                <span className="font-bold uppercase tracking-widest flex items-center gap-3 text-xs md:text-sm"><span className="text-elden-gold"><IconEye className="w-5 h-5 md:w-6 md:h-6" /></span> Splash Mode</span>
                                <span className="text-elden-green font-bold bg-[#14532d] px-2 py-1 text-xs md:text-sm rounded-md border border-elden-green/30">{dailyCompletion.splash || '-'} Guesses</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 w-full text-center">
                            <button
                                onClick={() => {
                                    const text = `Elden-Dle Summary:\n👤 Classic: ${dailyCompletion.classic}\n💬 Quote: ${dailyCompletion.quote}\n✨ Ability: ${dailyCompletion.ability}\n🖼️ Splash: ${dailyCompletion.splash}\nPlay at: www.eldendle.com`;
                                    navigator.clipboard.writeText(text);
                                    alert('Copied to clipboard!');
                                }}
                                className="w-full bg-elden-gold hover:bg-[#eeb317] text-elden-black font-bold uppercase tracking-widest py-3 rounded-lg shadow-[0_0_15px_rgba(198,162,91,0.4)] transition-colors"
                            >
                                Share Results
                            </button>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-xs mt-4">
                                Next challenge in <CountdownTimer className="text-elden-gold" />
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
