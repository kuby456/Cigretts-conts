

// מעקב אחר סיגריות וזמנים
let cigarettes = JSON.parse(localStorage.getItem('cigarettes')) || [];
let recordTime = parseInt(localStorage.getItem('recordTime')) || 0;
const maxCigarettes = 20;

// אלמנטים ב-DOM
const cigaretteCountEl = document.getElementById('cigaretteCount');
const percentageEl = document.getElementById('percentage');
const timeSinceLastEl = document.getElementById('timeSinceLast');
const recordTimeEl = document.getElementById('recordTime');
const smokeButton = document.getElementById('smokeButton');

// הגדרת גרף קו
const ctx = document.getElementById('progressChart').getContext('2d');
const progressChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'אחוזי עישון',
            data: [],
            borderColor: 'blue',
            fill: false,
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: { display: true, text: 'אחוזים' }
            },
            x: { title: { display: true, text: 'שעה' } }
        }
    }
});

// פונקציה להמרת זמן למילים
function timeToWords(ms) {
    if (!ms) return 'אין נתונים';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    let result = '';
    if (hours > 0) result += `${hours} שעות`;
    if (hours > 0 && minutes > 0) result += ' ו-';
    if (minutes > 0) result += `${minutes} דקות`;
    return result || 'פחות מדקה';
}

// סינון סיגריות של היום הנוכחי
function getTodayCigarettes() {
    const today = new Date().toDateString();
    return cigarettes.filter(time => new Date(time).toDateString() === today);
}

// עדכון התצוגה
function updateDisplay() {
    // סינון סיגריות של היום
    const todayCigarettes = getTodayCigarettes();
    const count = todayCigarettes.length;
    const percentage = ((count / maxCigarettes) * 100).toFixed(1);
    
    cigaretteCountEl.textContent = count;
    percentageEl.textContent = `${percentage}%`;

    // זמן מאז הסיגריה האחרונה
    if (todayCigarettes.length > 0) {
        const lastTime = todayCigarettes[todayCigarettes.length - 1];
        const timeDiff = Date.now() - lastTime;
        timeSinceLastEl.textContent = timeToWords(timeDiff);
    } else {
        timeSinceLastEl.textContent = 'אין נתונים';
    }

    // עדכון שיא
    recordTimeEl.textContent = timeToWords(recordTime);

    // עדכון סקאלה
    const scale = document.getElementById('scale');
    scale.style.background = `linear-gradient(to top, red ${percentage}%, transparent ${percentage}%)`;

    // עדכון גרף
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const data = Array(24).fill(0);
    todayCigarettes.forEach(time => {
        const hour = new Date(time).getHours();
        data[hour] = ((data[hour] + 1) / maxCigarettes) * 100;
    });
    progressChart.data.labels = hours;
    progressChart.data.datasets[0].data = data;
    progressChart.update();
}

// הוספת סיגריה
smokeButton.addEventListener('click', () => {
    const now = Date.now();
    cigarettes.push(now);

    // חישוב זמן בין סיגריות (כולל סיגריות מאתמול לשמירת שיא)
    if (cigarettes.length > 1) {
        const timeDiff = now - cigarettes[cigarettes.length - 2];
        if (timeDiff > recordTime) {
            recordTime = timeDiff;
            localStorage.setItem('recordTime', recordTime);
            alert(`שיא חדש! ${timeToWords(timeDiff)} בין סיגריות!`);
        }
    }

    // שמירה ב-localStorage
    localStorage.setItem('cigarettes', JSON.stringify(cigarettes));
    updateDisplay();
});

// ניקוי סיגריות ישנות (איפוס יומי)
function cleanOldCigarettes() {
    const today = new Date().toDateString();
    cigarettes = cigarettes.filter(time => new Date(time).toDateString() === today);
    localStorage.setItem('cigarettes', JSON.stringify(cigarettes));
    updateDisplay();
}

// בדיקה יומית לאיפוס
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        cleanOldCigarettes();
    }
}, 60000); // בדיקה כל דקה

// אתחול התצוגה
cleanOldCigarettes();
updateDisplay();