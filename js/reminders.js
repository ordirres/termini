import { EventModule } from './events.js';
import * as storage from './storage.js';

export const ReminderModule = (function() {
    let reminderInterval = null;

    function showNotification(event) {
        const title = `Erinnerung: ${event.title}`;
        const options = {
            body: `Beginnt um ${new Date(event.startDate).toLocaleTimeString('de-DE')}`,
            icon: './assets/icons/notification.svg' // Platzhalter-Icon
        };

        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, options);
        } else {
            // Fallback auf eine einfache In-App-Benachrichtigung
            alert(`${title}\n${options.body}`);
        }
    }

    function checkReminders() {
        console.log('Prüfe auf anstehende Erinnerungen...');
        const now = new Date();
        const allEvents = EventModule.getAllEvents();
        const shownReminders = storage.loadShownReminders();

        const upcomingEvents = allEvents.filter(event =>
            event.reminder.enabled && !shownReminders.includes(event.id)
        );

        upcomingEvents.forEach(event => {
            const startTime = new Date(event.startDate);
            const reminderTime = new Date(startTime.getTime() - event.reminder.minutesBefore * 60 * 1000);

            // Ist die Erinnerungszeit vergangen, aber der Termin hat noch nicht begonnen?
            if (now >= reminderTime && now < startTime) {
                console.log(`Erinnerung für '${event.title}' wird ausgelöst.`);
                showNotification(event);
                shownReminders.push(event.id);
                storage.saveShownReminders(shownReminders);
            }
        });
    }

    function start() {
        if (reminderInterval) {
            clearInterval(reminderInterval);
        }
        // Führe die Prüfung sofort einmal aus und dann alle 60 Sekunden
        checkReminders();
        reminderInterval = setInterval(checkReminders, 60000);
        console.log('Erinnerungssystem gestartet.');
    }

    function stop() {
        if (reminderInterval) {
            clearInterval(reminderInterval);
            reminderInterval = null;
            console.log('Erinnerungssystem gestoppt.');
        }
    }

    return {
        start,
        stop
    };
})();