// ---------- AKTYWNOŚĆ FIZYCZNA ----------

let currentActivityData = null;

function calculateCalories() {
  const person = document.getElementById('activityPerson').value;
  const weight = parseFloat(document.getElementById('activityWeight').value);
  const met = parseFloat(document.getElementById('activityType').value);
  const duration = parseInt(document.getElementById('activityDuration').value);
  
  if(!weight || !duration) {
    alert('Wypełnij wszystkie pola!');
    return;
  }
  
  // Wzór: Spalone kalorie = MET × waga (kg) × czas (h)
  const hours = duration / 60;
  const calories = Math.round(met * weight * hours);
  
  const activityName = document.getElementById('activityType').options[document.getElementById('activityType').selectedIndex].text;
  const personName = person === 'person1' ? namePerson1 : namePerson2;
  
  currentActivityData = {
    person: person,
    personName: personName,
    weight: weight,
    activity: activityName,
    met: met,
    duration: duration,
    calories: calories,
    date: new Date().toISOString().split('T')[0],
    dayOfWeek: new Date().getDay()
  };
  
  const resultDiv = document.getElementById('caloriesResult');
  resultDiv.innerHTML = `
    <div class="result-box">
      <h4>🔥 Wynik</h4>
      <p><strong>${personName}</strong> spalił(a):</p>
      <div class="result-value">${calories} kcal</div>
      <p style="font-size: 14px; color: #666; margin-top: 10px;">
        Aktywność: ${activityName}<br>
        Czas: ${duration} minut<br>
        Waga: ${weight} kg
      </p>
    </div>
  `;
  
  document.getElementById('saveActivityBtn').style.display = 'block';
}

function saveActivity() {
  if(!currentActivityData) return;
  
  let activities = JSON.parse(localStorage.getItem('activities') || '[]');
  activities.push(currentActivityData);
  localStorage.setItem('activities', JSON.stringify(activities));
  
  alert('✅ Aktywność zapisana!');
  displayActivityLog();
  currentActivityData = null;
  document.getElementById('saveActivityBtn').style.display = 'none';
}

function displayActivityLog() {
  const activities = JSON.parse(localStorage.getItem('activities') || '[]');
  const logDiv = document.getElementById('activityLog');
  const summaryDiv = document.getElementById('activitySummary');
  
  if(activities.length === 0) {
    logDiv.innerHTML = '<p style="color: #666; font-style: italic;">Brak zapisanych aktywności</p>';
    summaryDiv.innerHTML = '';
    return;
  }
  
  // Pogrupuj po dniach
  const byDay = {};
  dni.forEach((day, idx) => {
    byDay[idx] = [];
  });
  
  activities.forEach(act => {
    const day = act.dayOfWeek === 0 ? 6 : act.dayOfWeek - 1; // Konwersja na nasz system
    byDay[day].push(act);
  });
  
  let html = '';
  dni.forEach((day, idx) => {
    if(byDay[idx].length > 0) {
      html += `<div class="training-day"><strong>${day}</strong>`;
      byDay[idx].forEach((act, actIdx) => {
        html += `
          <div class="activity-item">
            <div>
              <strong>${act.personName}</strong>: ${act.activity}<br>
              <small>${act.duration} min • ${act.calories} kcal</small>
            </div>
            <button class="activity-delete" onclick="deleteActivity(${idx}, ${actIdx})">❌</button>
          </div>
        `;
      });
      html += '</div>';
    }
  });
  
  logDiv.innerHTML = html;
  
  // Podsumowanie
  const totalCalories1 = activities.filter(a => a.person === 'person1').reduce((sum, a) => sum + a.calories, 0);
  const totalCalories2 = activities.filter(a => a.person === 'person2').reduce((sum, a) => sum + a.calories, 0);
  
  summaryDiv.innerHTML = `
    <div class="result-box">
      <h4>📊 Podsumowanie tygodnia</h4>
      <p><strong>${namePerson1}:</strong> ${totalCalories1} kcal spalonych</p>
      <p><strong>${namePerson2}:</strong> ${totalCalories2} kcal spalonych</p>
    </div>
  `;
}

function deleteActivity(dayIdx, actIdx) {
  let activities = JSON.parse(localStorage.getItem('activities') || '[]');
  const filtered = activities.filter((act, idx) => {
    const actDay = act.dayOfWeek === 0 ? 6 : act.dayOfWeek - 1;
    return actDay !== dayIdx || idx !== actIdx;
  });
  localStorage.setItem('activities', JSON.stringify(filtered));
  displayActivityLog();
}

function filterActivityLog() {
  // TODO: Implement activity log filtering
  console.log('Activity log filtering not yet implemented');
}

function updateActivityTypeFilter() {
  // TODO: Implement activity type filter updates
  console.log('Activity type filter update not yet implemented');
}
