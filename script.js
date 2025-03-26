document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
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

    // Create Toast Container
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);

    // Improved Toast Notification Function
    function showToast(message, type = 'info') {
        // Ensure toast container exists
        const container = document.getElementById('toast-container') || (() => {
            const newContainer = document.createElement('div');
            newContainer.id = 'toast-container';
            document.body.appendChild(newContainer);
            return newContainer;
        })();

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add vibration and animation
        toast.style.animation = 'vibrate 0.5s, fadeIn 0.5s';
        
        // Append toast to container
        container.appendChild(toast);

        // Remove toast after 3 seconds
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

    // Rest of the existing code remains the same...
    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            
            const targetId = tab.getAttribute('data-target') + '-tab';
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Theme Management
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.getAttribute('data-theme');
            document.body.className = `theme-${theme}`;
            localStorage.setItem('app-theme', theme);
            showToast(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme applied`, 'success');
        });
    });

    // Load Saved Theme
    const savedTheme = localStorage.getItem('app-theme') || 'dark';
    document.body.className = `theme-${savedTheme}`;

    // Time Format Management
    let timeFormat = localStorage.getItem('time-format') || '12';
    timeFormatSelect.value = timeFormat;

    timeFormatSelect.addEventListener('change', () => {
        timeFormat = timeFormatSelect.value;
        localStorage.setItem('time-format', timeFormat);
        showToast(`Time format changed to ${timeFormat}-hour`, 'info');
    });

    // Clock Functionality
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        let ampm = '';

        // Time format conversion
        if (timeFormat === '12') {
            ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // handle midnight
        }

        const formattedHours = String(hours).padStart(2, '0');
        timeDisplay.textContent = `${formattedHours}:${minutes}:${seconds} ${ampm}`.trim();
        
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        dateDisplay.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    }

    // Alarm Functionality
    let alarms = JSON.parse(localStorage.getItem('alarms')) || [];

    function renderAlarms() {
        alarmList.innerHTML = '';
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

    // Alarm Check
    function checkAlarms() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12 || 12;
        const currentTime = `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;

        alarms.forEach((alarm, index) => {
            if (alarm === currentTime) {
                // Show vibrating toast
                showToast(`Alarm: ${alarm}`, 'alarm');
            }
        });
    }

    // Timer Functionality
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

    // Event Listeners
    startTimerBtn.addEventListener('click', startTimer);
    resetTimerBtn.addEventListener('click', resetTimer);

    // Initial render and continuous updates
    renderAlarms();
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(checkAlarms, 1000);
});