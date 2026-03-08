import React, { useState, useEffect } from 'react';

/**
 * Countdown timer until the next puzzle reset at local 23:00.
 * Uses the same local-time logic as useDaily.js.
 */
export default function CountdownTimer({ className = '' }) {
    const [timeLeft, setTimeLeft] = useState(getTimeUntilReset());

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getTimeUntilReset());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const hours = String(timeLeft.hours).padStart(2, '0');
    const minutes = String(timeLeft.minutes).padStart(2, '0');
    const seconds = String(timeLeft.seconds).padStart(2, '0');

    return (
        <span className={className}>
            {hours}:{minutes}:{seconds}
        </span>
    );
}

function getTimeUntilReset() {
    const now = new Date();

    // Next reset is at 23:00 local time today, or tomorrow if past 23:00
    const resetToday = new Date(now);
    resetToday.setHours(23, 0, 0, 0);

    let target = resetToday;
    if (now >= resetToday) {
        // Already past 23:00 today, target is tomorrow 23:00
        target = new Date(resetToday.getTime() + 24 * 60 * 60 * 1000);
    }

    const diff = Math.max(0, target - now);
    const totalSeconds = Math.floor(diff / 1000);

    return {
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
    };
}
