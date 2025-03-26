document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const themeButtons = document.querySelectorAll('.theme-btn');
    const timeFormatSelect = document.getElementById('time-format');
    const alarmTimeInput = document.getElementById('alarm-time');
    const addAlarmBtn = document.getElementById('add-alarm-btn');
    const alarmList = document.getElementById('alarm-list');
    const timeDisplay = document.getElementById('time-display');
    const dateDisplay = document.getElementById('date-display');
    const startTimerBtn = document.getElementById('start-timer-btn');
    const resetTimerBtn = document.getElementById('reset-timer-btn');
    const timerDisplay = document.getElementById('timer-display');
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);

    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container') || (() => {
            const newContainer = document.createElement('div');
            newContainer.id = 'toast-container';
            document.body.appendChild(newContainer);
            return newContainer;
        })();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.animation = 'vibrate 0.5s, fadeIn 0.5s';
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.5s';
            setTimeout(() => {
                try {
                    container.removeChild(toast);
                } catch (error) {
                    console.warn('Could not remove toast:', error);
                }
            }, 500);
        }, 3000);
    }
    function showAlarmToast(alarmTime) {
        const container = document.getElementById('toast-container') || (() => {
            const newContainer = document.createElement('div');
            newContainer.id = 'toast-container';
            document.body.appendChild(newContainer);
            return newContainer;
        })();
        const alarmToast = document.createElement('div');
        alarmToast.className = 'toast toast-alarm alarm-full-screen';
        const contentWrapper = document.createElement('div');
        contentWrapper.innerHTML = `
            <h2>Alarm</h2>
            <p>${alarmTime}</p>
        `;
        const actionContainer = document.createElement('div');
        actionContainer.className = 'alarm-actions';
        const removeAlarmToast = () => {
            const alarms = JSON.parse(localStorage.getItem('alarms')) || [];
            const updatedAlarms = alarms.filter(alarm => alarm !== alarmTime);
            localStorage.setItem('alarms', JSON.stringify(updatedAlarms));
            renderAlarms();
            if (alarmToast.parentElement) {
                alarmToast.parentElement.removeChild(alarmToast);
            }
        };
        const snoozeBtn = document.createElement('button');
        snoozeBtn.textContent = 'Snooze 5 min';
        snoozeBtn.className = 'alarm-btn snooze-btn';
        snoozeBtn.addEventListener('click', () => {
            const [time, period] = alarmTime.split(' ');
            const [hours, minutes] = time.split(':').map(Number);
            let newMinutes = minutes + 5;
            let newHours = hours;

            if (newMinutes >= 60) {
                newHours += 1;
                newMinutes %= 60;
            }
            const newTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')} ${period}`;
            const alarms = JSON.parse(localStorage.getItem('alarms')) || [];
            const index = alarms.findIndex(alarm => alarm === alarmTime);
            if (index !== -1) {
                alarms[index] = newTime;
                localStorage.setItem('alarms', JSON.stringify(alarms));
            }
            removeAlarmToast();
            showToast(`Alarm snoozed to ${newTime}`, 'info');
        });
        const dismissBtn = document.createElement('button');
        dismissBtn.textContent = 'Dismiss';
        dismissBtn.className = 'alarm-btn dismiss-btn';
        dismissBtn.addEventListener('click', removeAlarmToast);
        actionContainer.appendChild(snoozeBtn);
        actionContainer.appendChild(dismissBtn);
        alarmToast.appendChild(contentWrapper);
        alarmToast.appendChild(actionContainer);
        container.appendChild(alarmToast);
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .alarm-full-screen {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80%;
                max-width: 400px;
                background-color: #e74c3c;
                color: white;
                text-align: center;
                padding: 30px;
                border-radius: 10px;
                z-index: 9999;
                animation: vibrate 0.5s infinite;
                box-shadow: 0 0 20px rgba(0,0,0,0.5);
            }
            .alarm-full-screen h2 {
                margin-bottom: 20px;
                font-size: 2rem;
            }
            .alarm-full-screen p {
                font-size: 1.5rem;
                margin-bottom: 20px;
            }
            .alarm-actions {
                display: flex;
                justify-content: center;
                gap: 20px;
            }
            .alarm-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                font-size: 1rem;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            .snooze-btn {
                background-color: #f39c12;
                color: white;
            }
            .dismiss-btn {
                background-color: #2c3e50;
                color: white;
            }
            .alarm-btn:hover {
                opacity: 0.9;
            }
        `;
        document.head.appendChild(styleElement);
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target') + '-tab';
            document.getElementById(targetId).classList.add('active');
        });
    });

    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.getAttribute('data-theme');
            document.body.className = `theme-${theme}`;
            localStorage.setItem('app-theme', theme);
            showToast(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme applied`, 'success');
        });
    });

    const savedTheme = localStorage.getItem('app-theme') || 'dark';
    document.body.className = `theme-${savedTheme}`;

    let timeFormat = localStorage.getItem('time-format') || '12';
    timeFormatSelect.value = timeFormat;

    timeFormatSelect.addEventListener('change', () => {
        timeFormat = timeFormatSelect.value;
        localStorage.setItem('time-format', timeFormat);
        showToast(`Time format changed to ${timeFormat}-hour`, 'info');
    });

    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        let ampm = '';
        if (timeFormat === '12') {
            ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
        }

        const formattedHours = String(hours).padStart(2, '0');
        timeDisplay.textContent = `${formattedHours}:${minutes}:${seconds} ${ampm}`.trim();
        
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        dateDisplay.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    }

    let alarms = JSON.parse(localStorage.getItem('alarms')) || [];

    function renderAlarms() {
        alarmList.innerHTML = '';
        alarms = JSON.parse(localStorage.getItem('alarms')) || []; // Refresh alarms from storage
        alarms.forEach((alarm, index) => {
            const alarmItem = document.createElement('div');
            alarmItem.classList.add('alarm-item');
            const alarmTime = document.createElement('span');
            alarmTime.textContent = alarm;
            const actions = document.createElement('div');
            actions.classList.add('alarm-item-actions');
            const snoozeBtn = document.createElement('button');
            snoozeBtn.innerHTML = '⏰';
            snoozeBtn.classList.add('snooze-alarm');
            snoozeBtn.addEventListener('click', () => {
                const [time, period] = alarm.split(' ');
                const [hours, minutes] = time.split(':').map(Number);
                let newMinutes = minutes + 5;
                let newHours = hours;

                if (newMinutes >= 60) {
                    newHours += 1;
                    newMinutes %= 60;
                }

                const newTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')} ${period}`;
                alarms[index] = newTime;
                localStorage.setItem('alarms', JSON.stringify(alarms));
                renderAlarms();
                showToast(`Alarm snoozed to ${newTime}`, 'info');
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '✕';
            deleteBtn.classList.add('delete-alarm');
            deleteBtn.addEventListener('click', () => {
                alarms.splice(index, 1);
                localStorage.setItem('alarms', JSON.stringify(alarms));
                renderAlarms();
                showToast('Alarm deleted', 'warning');
            });
            actions.appendChild(snoozeBtn);
            actions.appendChild(deleteBtn);
            alarmItem.appendChild(alarmTime);
            alarmItem.appendChild(actions);
            alarmList.appendChild(alarmItem);
        });
    }

    addAlarmBtn.addEventListener('click', () => {
        const alarmTime = alarmTimeInput.value;
        if (alarmTime) {
            const [hours, minutes] = alarmTime.split(':').map(Number);
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12;
            const formattedTime = `${formattedHours}:${String(minutes).padStart(2, '0')} ${ampm}`;
            
            alarms.push(formattedTime);
            localStorage.setItem('alarms', JSON.stringify(alarms));
            renderAlarms();
            alarmTimeInput.value = '';
            showToast(`Alarm set for ${formattedTime}`, 'success');
        }
    });

    function checkAlarms() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const currentTime = `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
        
        alarms.forEach((alarm, index) => {
            if (alarm === currentTime) {
                showAlarmToast(alarm);
            }
        });
    }

    let timerInterval;
    let totalSeconds = 0;
    let isTimerRunning = false;

    function startTimer() {
        if (!isTimerRunning) {
            isTimerRunning = true;
            timerInterval = setInterval(() => {
                totalSeconds++;
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }, 1000);
            startTimerBtn.textContent = 'Pause';
        } else {
            clearInterval(timerInterval);
            isTimerRunning = false;
            startTimerBtn.textContent = 'Resume';
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        totalSeconds = 0;
        isTimerRunning = false;
        timerDisplay.textContent = '00:00:00';
        startTimerBtn.textContent = 'Start';
    }

    startTimerBtn.addEventListener('click', startTimer);
    resetTimerBtn.addEventListener('click', resetTimer);
    renderAlarms();
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(checkAlarms, 1000);
});