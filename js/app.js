import { CalendarModule } from './calendar.js';
import { EventModule } from './events.js';
import { ReminderModule } from './reminders.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM-Elemente ---
    const modal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-title');
    const newEventBtn = document.getElementById('new-event-btn');
    const cancelEventBtn = document.getElementById('cancel-event-btn');
    const eventForm = document.getElementById('event-form');
    const deleteEventBtn = document.getElementById('delete-event-btn');
    const reminderCheckbox = document.getElementById('event-reminder');
    const reminderSelect = document.getElementById('event-reminder-time');

    // --- Modal-Logik ---
    function openModal(date) {
        eventForm.reset();
        modalTitle.textContent = 'Neuer Termin';
        deleteEventBtn.style.display = 'none';
        document.getElementById('event-id').value = '';
        if (date) {
            // Setzt das Startdatum auf den angeklickten Tag, falls ein Datum übergeben wird.
            const defaultTime = new Date(date);
            defaultTime.setHours(9); // Standard-Uhrzeit 9:00
            document.getElementById('event-start-date').value = defaultTime.toISOString().substring(0, 16);
        }
        modal.style.display = 'flex';
        document.getElementById('event-title').focus();
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    function openEditModal(event) {
        eventForm.reset();
        modalTitle.textContent = 'Termin bearbeiten';
        deleteEventBtn.style.display = 'block';

        document.getElementById('event-id').value = event.id;
        document.getElementById('event-title').value = event.title;
        document.getElementById('event-description').value = event.description;
        // Format für datetime-local: YYYY-MM-DDTHH:mm
        document.getElementById('event-start-date').value = event.startDate.substring(0, 16);
        if (event.endDate) {
            document.getElementById('event-end-date').value = event.endDate.substring(0, 16);
        }
        reminderCheckbox.checked = event.reminder.enabled;
        reminderSelect.disabled = !event.reminder.enabled;
        if (event.reminder.enabled) {
            reminderSelect.value = event.reminder.minutesBefore;
        }

        modal.style.display = 'flex';
    }

    // --- Event-Listener ---
    newEventBtn.addEventListener('click', () => openModal(new Date()));
    cancelEventBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) { // Schließen bei Klick auf Overlay
            closeModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    reminderCheckbox.addEventListener('change', () => {
        reminderSelect.disabled = !reminderCheckbox.checked;
    });

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(eventForm);
        const eventId = formData.get('eventId');

        const eventData = {
            title: formData.get('title'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate') || null,
            description: formData.get('description'),
            reminder: {
                enabled: formData.get('reminderEnabled') === 'on',
                minutesBefore: parseInt(formData.get('reminderMinutesBefore'), 10)
            }
        };

        if (eventId) {
            // Event aktualisieren
            EventModule.updateEvent(eventId, eventData);
        } else {
            // Event erstellen
            EventModule.createEvent(eventData);
        }

        closeModal();
        CalendarModule.render(); // Kalender neu rendern, um Änderungen anzuzeigen
    });

    deleteEventBtn.addEventListener('click', () => {
        const eventId = document.getElementById('event-id').value;
        if (confirm('Möchten Sie diesen Termin wirklich löschen?')) {
            EventModule.deleteEvent(eventId);
            closeModal();
            CalendarModule.render();
        }
    });


    // --- Globale Initialisierung ---
    CalendarModule.render();

    // --- Navigation und Ansicht-Wechsler ---
    function setupControls() {
        const viewButtons = document.querySelectorAll('.view-switcher button');

        document.getElementById('prev-btn').addEventListener('click', () => CalendarModule.prev());
        document.getElementById('next-btn').addEventListener('click', () => CalendarModule.next());
        document.getElementById('today-btn').addEventListener('click', () => CalendarModule.goToToday());

        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                viewButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const view = button.id.replace('-view-btn', ''); // 'month', 'week', 'day'
                CalendarModule.switchView(view);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Ignoriere, wenn der Fokus auf einem Input, Textarea oder Select liegt
            if (e.target.matches('input, textarea, select')) {
                return;
            }
            switch (e.key) {
                case 'ArrowLeft':
                    CalendarModule.prev();
                    break;
                case 'ArrowRight':
                    CalendarModule.next();
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                    // Könnte für Wochen/Tagesansicht nützlich sein, vorerst keine Aktion
                    break;
            }
        });

        // Globaler Klick-Listener für Events
        document.getElementById('calendar-container').addEventListener('click', (e) => {
            const target = e.target.closest('[data-event-id]');
            if (target) {
                const eventId = target.dataset.eventId;
                const event = EventModule.getEventById(eventId);
                if (event) {
                    openEditModal(event);
                }
            }
        });
    }

    // --- Benachrichtigungs-Berechtigung ---
    function requestNotificationPermission() {
        if ('Notification' in window) {
            if (Notification.permission !== 'denied' && Notification.permission !== 'granted') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        console.log('Berechtigung für Benachrichtigungen erteilt.');
                    }
                });
            }
        }
    }

    // --- Init ---
    setupControls();
    CalendarModule.render();
    requestNotificationPermission();
    ReminderModule.start();
});