import { EventModule } from './events.js';

export const CalendarModule = (function() {
    let currentDate = new Date();
    let currentView = 'month'; // 'month', 'week', 'day'
    const calendarContainer = document.getElementById('calendar-container');

    function render() {
        switch (currentView) {
            case 'week':
                renderWeekView();
                break;
            case 'day':
                renderDayView();
                break;
            case 'month':
            default:
                renderMonthView();
                break;
        }
        updateHeaderTitle();
    }

    function switchView(view) {
        currentView = view;
        render();
    }

    function next() {
        switch (currentView) {
            case 'week':
                currentDate.setDate(currentDate.getDate() + 7);
                break;
            case 'day':
                currentDate.setDate(currentDate.getDate() + 1);
                break;
            case 'month':
            default:
                currentDate.setMonth(currentDate.getMonth() + 1);
                break;
        }
        render();
    }

    function prev() {
        switch (currentView) {
            case 'week':
                currentDate.setDate(currentDate.getDate() - 7);
                break;
            case 'day':
                currentDate.setDate(currentDate.getDate() - 1);
                break;
            case 'month':
            default:
                currentDate.setMonth(currentDate.getMonth() - 1);
                break;
        }
        render();
    }

    function goToToday() {
        currentDate = new Date();
        render();
    }

    // --- Wochenansicht ---
    function getWeekDays(date) {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        // Setzt auf den vergangenen Montag
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);

        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            weekDays.push(day);
        }
        return weekDays;
    }

    function renderWeekView() {
        calendarContainer.innerHTML = '';
        const weekDays = getWeekDays(currentDate);

        const grid = document.createElement('div');
        grid.className = 'calendar-grid-week';

        // Zeit-Spalte
        const timeColumn = document.createElement('div');
        timeColumn.className = 'time-column';
        for (let hour = 0; hour < 24; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = `${hour.toString().padStart(2, '0')}:00`;
            timeColumn.appendChild(timeSlot);
        }
        grid.appendChild(timeColumn);

        // Tage-Spalten
        weekDays.forEach(day => {
            const dayColumn = document.createElement('div');
            dayColumn.className = 'day-column';
            dayColumn.dataset.date = day.toISOString();

            // Header für den Tag
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.innerHTML = `${day.toLocaleString('de-DE', { weekday: 'short' })}<br>${day.getDate()}. ${day.toLocaleString('de-DE', { month: 'short' })}`;
            if (day.toDateString() === new Date().toDateString()) {
                dayHeader.classList.add('today');
            }
            dayColumn.appendChild(dayHeader);

            // Events für diesen Tag
            const startOfDay = new Date(day);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(day);
            endOfDay.setHours(23, 59, 59, 999);

            const eventsForDay = EventModule.getEventsByDateRange(startOfDay, endOfDay);
            eventsForDay.forEach(event => {
                const eventEl = document.createElement('div');
                eventEl.className = 'event-block';
                eventEl.dataset.eventId = event.id;
                eventEl.textContent = event.title;

                const start = new Date(event.startDate);
                const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 60 * 60 * 1000); // 1h default

                const startMinutes = start.getHours() * 60 + start.getMinutes();
                const endMinutes = end.getHours() * 60 + end.getMinutes();
                const duration = Math.max(30, endMinutes - startMinutes); // Mind. 30min Blöcke

                eventEl.style.top = `${(startMinutes / 60) * 50}px`; // 50px pro Stunde
                eventEl.style.height = `${(duration / 60) * 50}px`;

                dayColumn.appendChild(eventEl);
            });
            grid.appendChild(dayColumn);
        });
        calendarContainer.appendChild(grid);
    }

    // --- Tagesansicht ---
    function renderDayView() {
        calendarContainer.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'calendar-grid-day';

        // Zeit-Spalte
        const timeColumn = document.createElement('div');
        timeColumn.className = 'time-column';
        for (let hour = 0; hour < 24; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = `${hour.toString().padStart(2, '0')}:00`;
            timeColumn.appendChild(timeSlot);
        }
        grid.appendChild(timeColumn);

        // Tages-Spalte
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';

        const startOfDay = new Date(currentDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(currentDate);
        endOfDay.setHours(23, 59, 59, 999);

        const eventsForDay = EventModule.getEventsByDateRange(startOfDay, endOfDay);
        eventsForDay.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = 'event-block';
            eventEl.dataset.eventId = event.id;
            eventEl.innerHTML = `<strong>${event.title}</strong><br><small>${event.description || ''}</small>`;

            const start = new Date(event.startDate);
            const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 60 * 60 * 1000);

            const startMinutes = start.getHours() * 60 + start.getMinutes();
            const endMinutes = end.getHours() * 60 + end.getMinutes();
            const duration = Math.max(30, endMinutes - startMinutes);

            eventEl.style.top = `${(startMinutes / 60) * 50}px`;
            eventEl.style.height = `${(duration / 60) * 50}px`;

            dayColumn.appendChild(eventEl);
        });

        // Aktuelle Zeit-Marker
        if (currentDate.toDateString() === new Date().toDateString()) {
            const now = new Date();
            const position = (now.getHours() * 60 + now.getMinutes()) / 60 * 50;
            const timeMarker = document.createElement('div');
            timeMarker.className = 'time-marker';
            timeMarker.style.top = `${position}px`;
            dayColumn.appendChild(timeMarker);
        }

        grid.appendChild(dayColumn);
        calendarContainer.appendChild(grid);
    }


    // --- Monatsansicht ---
    function calculateMonthData(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        // Korrektur für getDay(): Sonntag ist 0, wir wollen Montag als 0
        const startWeekday = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

        return {
            firstDay,
            lastDay,
            daysInMonth,
            startWeekday
        };
    }

    function render() {
        // Aktuell wird nur die Monatsansicht unterstützt
        renderMonthView();
    }

    function renderMonthView() {
        calendarContainer.innerHTML = ''; // Kalender leeren

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const monthData = calculateMonthData(year, month);
        const allEvents = EventModule.getAllEvents();

        // Header für Wochentage
        const header = document.createElement('div');
        header.className = 'calendar-grid-header';
        const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
        weekdays.forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.textContent = day;
            header.appendChild(dayEl);
        });
        calendarContainer.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'calendar-grid-month';

        // Tage des Vormonats
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = monthData.startWeekday; i > 0; i--) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell other-month';
            dayCell.textContent = prevMonthLastDay - i + 1;
            grid.appendChild(dayCell);
        }

        // Tage des aktuellen Monats
        for (let day = 1; day <= monthData.daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            const dayDate = new Date(year, month, day);

            if (day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
                dayCell.classList.add('today');
            }

            const dayNumber = document.createElement('span');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayCell.appendChild(dayNumber);

            // Events für diesen Tag finden und anzeigen
            const eventsForDay = allEvents.filter(event => {
                const eventDate = new Date(event.startDate);
                return eventDate.toDateString() === dayDate.toDateString();
            });

            dayCell.dataset.date = dayDate.toISOString();
            const eventsContainer = document.createElement('div');
            eventsContainer.className = 'events-container';

            if (eventsForDay.length > 0) {
                eventsForDay.slice(0, 2).forEach(event => { // Max 2 Events anzeigen
                    const eventBadge = document.createElement('div');
                    eventBadge.className = 'event-badge';
                    eventBadge.textContent = event.title;
                    eventBadge.dataset.eventId = event.id; // Wichtig für Klick-Events
                    eventsContainer.appendChild(eventBadge);
                });
                if (eventsForDay.length > 2) {
                    const moreBadge = document.createElement('div');
                    moreBadge.className = 'event-badge more';
                    moreBadge.textContent = `+${eventsForDay.length - 2} mehr`;
                    eventsContainer.appendChild(moreBadge);
                }
            }
            dayCell.appendChild(eventsContainer);

            grid.appendChild(dayCell);
        }

        // Tage des Folgemonats
        const totalCells = monthData.startWeekday + monthData.daysInMonth;
        const remainingCells = (totalCells % 7 === 0) ? 0 : 7 - (totalCells % 7);
        for (let i = 1; i <= remainingCells; i++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell other-month';
            dayCell.textContent = i;
            grid.appendChild(dayCell);
        }

        calendarContainer.appendChild(grid);
        updateHeaderTitle();

    }

    function updateHeaderTitle() {
        const titleElement = document.getElementById('current-month-year');
        if (!titleElement) return;

        let title = '';
        const year = currentDate.getFullYear();
        const monthName = currentDate.toLocaleString('de-DE', { month: 'long' });

        switch (currentView) {
            case 'week':
                const weekDays = getWeekDays(currentDate);
                const startDay = weekDays[0].getDate();
                const startMonth = weekDays[0].toLocaleString('de-DE', { month: 'short' });
                const endDay = weekDays[6].getDate();
                const endMonth = weekDays[6].toLocaleString('de-DE', { month: 'short' });
                title = `Woche: ${startDay}. ${startMonth} - ${endDay}. ${endMonth} ${year}`;
                break;
            case 'day':
                title = currentDate.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                break;
            case 'month':
            default:
                title = `${monthName} ${year}`;
                break;
        }
        titleElement.textContent = title;
    }

    return {
        render,
        switchView,
        next,
        prev,
        goToToday
    };
})();