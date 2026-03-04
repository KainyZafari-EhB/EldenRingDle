import React, { useState, useRef, useEffect } from 'react';
import { characters } from '../data/characters';

export default function Search({ onGuess, guessedIds }) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const wrapperRef = useRef(null);
    const itemRefs = useRef([]);

    const availableChars = characters.filter(c => !guessedIds.includes(c.id));

    const filtered = availableChars.filter(c =>
        c.name.toLowerCase().startsWith(query.toLowerCase())
    );

    const handleSelect = (char) => {
        onGuess(char);
        setQuery('');
        setIsOpen(false);
        setSelectedIndex(-1);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Reset selected index when filtered list changes or gets hidden
    useEffect(() => {
        setSelectedIndex(-1);
    }, [query, isOpen]);

    // Scroll selected item into view
    useEffect(() => {
        if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
            itemRefs.current[selectedIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [selectedIndex]);

    const handleKeyDown = (e) => {
        if (!isOpen || filtered.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prevIndex) =>
                prevIndex < filtered.length - 1 ? prevIndex + 1 : prevIndex
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prevIndex) =>
                prevIndex > 0 ? prevIndex - 1 : prevIndex
            );
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < filtered.length) {
                handleSelect(filtered[selectedIndex]);
            } else if (filtered.length > 0) {
                // If they hit enter but nothing is selected, arguably select the first one?
                // Let's go with just selecting the first one to be fast.
                handleSelect(filtered[0]);
            }
        }
    };

    const getInitials = (name) => name.substring(0, 2).toUpperCase();

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md mx-auto z-10 mb-8 mt-4">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Type character name..."
                    className="w-full p-4 pl-12 rounded-xl bg-[#1e1e1e]/80 text-[#e5e5e5] border-2 border-elden-gold/50 focus:outline-none focus:border-elden-gold transition-all shadow-[0_0_20px_rgba(198,162,91,0.15)] focus:shadow-[0_0_30px_rgba(198,162,91,0.4)] backdrop-blur-md font-bold text-lg"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-elden-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {isOpen && query && filtered.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-3 bg-[#111111]/95 backdrop-blur-xl border-2 border-elden-gold/30 rounded-xl shadow-2xl max-h-72 overflow-y-auto z-50 overflow-hidden hide-scrollbar">
                    {filtered.map((char, index) => (
                        <li
                            key={char.id}
                            ref={el => itemRefs.current[index] = el}
                            className={`p-3 cursor-pointer border-b border-white/5 last:border-0 flex items-center gap-4 transition-all duration-200 
                                ${selectedIndex === index ? 'bg-[#3d3d3d] border-l-4 border-l-elden-gold' : 'hover:bg-[#2d2d2d] border-l-4 border-l-transparent'}`}
                            onClick={() => handleSelect(char)}
                        >
                            <div className="w-12 h-12 rounded bg-gradient-to-br from-[#2a2a2a] to-[#0a0a0a] border border-elden-gold/40 flex items-center justify-center text-elden-gold font-bold text-sm shadow-md overflow-hidden relative">
                                {char.image ? (
                                    <img src={char.image} alt={char.name} className="w-full h-full object-cover object-top" />
                                ) : (
                                    getInitials(char.name)
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-elden-gold text-lg tracking-wide">{char.name}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-widest">{char.species}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
