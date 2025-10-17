import * as storage from './storage.js';

export const EventModule = (function() {
    let events = storage.loadEvents();

    // Private Hilfsfunktion zur UUID-Generierung
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Private Hilfsfunktion zur Validierung
    function validateEvent(eventData) {
        if (!eventData.title || eventData.title.trim().length === 0 || eventData.title.length > 100) {
            alert('Der Titel ist ungültig. Er darf nicht leer sein und maximal 100 Zeichen haben.');
            return false;
        }
        if (eventData.description && eventData.description.length > 500) {
            alert('Die Beschreibung darf maximal 500 Zeichen haben.');
            return false;
        }
        const startDate = new Date(eventData.startDate);
        if (isNaN(startDate.getTime()) || startDate < new Date()) {
            alert('Das Startdatum muss in der Zukunft liegen.');
            return false;
        }
        if (eventData.endDate) {
            const endDate = new Date(eventData.endDate);
            if (isNaN(endDate.getTime()) || endDate <= startDate) {
                alert('Das Enddatum muss nach dem Startdatum liegen.');
                return false;
            }
        }
        return true;
    }

    function createEvent(eventData) {
        if (!validateEvent(eventData)) {
            return null;
        }

        const now = new Date().toISOString();
        const newEvent = {
            id: generateUUID(),
            title: eventData.title.trim(),
            description: eventData.description ? eventData.description.trim() : '',
            startDate: new Date(eventData.startDate).toISOString(),
            endDate: eventData.endDate ? new Date(eventData.endDate).toISOString() : null,
            reminder: eventData.reminder || { enabled: false, minutesBefore: 15 },
            created: now,
            modified: now
        };

        events.push(newEvent);
        storage.saveEvents(events);
        return newEvent;
    }

    function updateEvent(id, eventData) {
        const eventIndex = events.findIndex(e => e.id === id);
        if (eventIndex === -1) {
            console.error(`Event mit ID ${id} nicht gefunden.`);
            return null;
        }

        if (!validateEvent(eventData)) {
            return null;
        }

        const updatedEvent = {
            ...events[eventIndex],
            ...eventData,
            title: eventData.title.trim(),
            description: eventData.description ? eventData.description.trim() : '',
            startDate: new Date(eventData.startDate).toISOString(),
            endDate: eventData.endDate ? new Date(eventData.endDate).toISOString() : null,
            modified: new Date().toISOString()
        };

        events[eventIndex] = updatedEvent;
        storage.saveEvents(events);
        return updatedEvent;
    }

    function deleteEvent(id) {
        const initialLength = events.length;
        events = events.filter(e => e.id !== id);
        if (events.length < initialLength) {
            storage.saveEvents(events);
            return true;
        }
        return false;
    }

    function getEventById(id) {
        return events.find(e => e.id === id);
    }

    function getEventsByDateRange(start, end) {
        return events.filter(event => {
            const eventStart = new Date(event.startDate);
            // Simpler Check: Ignoriert die Dauer, nur der Startzeitpunkt zählt für die Filterung.
            // Dies kann später verfeinert werden, um überlappende Events besser zu erfassen.
            return eventStart >= start && eventStart < end;
        });
    }

    function getAllEvents() {
        return [...events];
    }

    return {
        createEvent,
        updateEvent,
        deleteEvent,
        getEventById,
        getEventsByDateRange,
        getAllEvents
    };
})();