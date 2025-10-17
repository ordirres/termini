const EVENTS_KEY = 'terminplaner_events';
const REMINDER_SHOWN_KEY = 'terminplaner_reminder_shown';

// Prüfen, ob LocalStorage verfügbar ist
function checkStorageAvailability() {
    try {
        const storage = window.localStorage;
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return false;
    }
}

export const isStorageAvailable = checkStorageAvailability();

if (!isStorageAvailable) {
    alert('Ihr Browser unterstützt LocalStorage nicht oder hat es blockiert. Die App kann nicht verwendet werden.');
}

export function saveEvents(events) {
    if (!isStorageAvailable) return;
    try {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch (e) {
        console.error('Fehler beim Speichern der Termine:', e);
        // Gemäß Pflichtenheft 8.1
        if (e.name === 'QuotaExceededError') {
            alert('Der lokale Speicherplatz ist voll. Bitte löschen Sie alte Termine, um neue anlegen zu können.');
        }
    }
}

export function loadEvents() {
    if (!isStorageAvailable) return [];
    try {
        const eventsJSON = localStorage.getItem(EVENTS_KEY);
        return eventsJSON ? JSON.parse(eventsJSON) : [];
    } catch (e) {
        console.error('Fehler beim Laden der Termine:', e);
        return [];
    }
}

export function saveShownReminders(shownIds) {
    if (!isStorageAvailable) return;
    localStorage.setItem(REMINDER_SHOWN_KEY, JSON.stringify(shownIds));
}

export function loadShownReminders() {
    if (!isStorageAvailable) return [];
    const idsJSON = localStorage.getItem(REMINDER_SHOWN_KEY);
    return idsJSON ? JSON.parse(idsJSON) : [];
}