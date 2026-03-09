export function getEldenDleDayIndex() {
    // We want the new day to start at 23:00 (11 PM) daily
    const now = new Date();

    // Convert current time to a base day value by shifting it forward by 1 hour.
    // So 23:00 becomes 00:00 of the *next* day for calculation purposes.
    const shiftedTime = new Date(now.getTime() + (1 * 60 * 60 * 1000));

    // Create a string or number that represents this exact day uniquely
    // e.g. "2023-10-05"
    const year = shiftedTime.getFullYear();
    const month = String(shiftedTime.getMonth() + 1).padStart(2, '0');
    const day = String(shiftedTime.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// Simple deterministic random number generator based on a string seed
export function getDailyTargetIndex(dayIndexString, seedModifier, maxNumber) {
    let hash = 0;
    const seedString = dayIndexString + seedModifier;

    for (let i = 0; i < seedString.length; i++) {
        const char = seedString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    // Ensure positive number
    const positiveHash = Math.abs(hash);

    // Return an index within the bounds of the array
    return positiveHash % maxNumber;
}

export function getYesterdayDayIndex() {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const shiftedTime = new Date(yesterday.getTime() + (1 * 60 * 60 * 1000));
    const year = shiftedTime.getFullYear();
    const month = String(shiftedTime.getMonth() + 1).padStart(2, '0');
    const day = String(shiftedTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
