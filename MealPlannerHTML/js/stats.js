// ---------- STATYSTYKI & GARMIN ----------

// Przechowywanie danych treningowych
function getTrainingData() {
  const data = localStorage.getItem('garminTrainingData');
  return data ? JSON.parse(data) : { person1: [], person2: [] };
}

function saveTrainingData(data) {
  localStorage.setItem('garminTrainingData', JSON.stringify(data));
  updateStatsSummary();
  displayTrainingHistory();
  updateActivityTypeFilter();
}

// Obsługa uploadu CSV
function handleCSVUpload(person) {
  const fileInput = document.getElementById(`csvFilePerson${person}`);
  const file = fileInput.files[0];
  
  if (!file) return;
  
  const statusDiv = document.getElementById(`csvStatus${person}`);
  statusDiv.innerHTML = '⏳ Wczytywanie...';
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const csv = e.target.result;
      const workouts = parseGarminCSV(csv);
      
      if (workouts.length === 0) {
        statusDiv.innerHTML = '❌ Nie znaleziono danych w pliku';
        return;
      }
      
      const data = getTrainingData();
      const personKey = `person${person}`;
      
      // Dodaj nowe treningi (unikaj duplikatów po dacie)
      workouts.forEach(workout => {
        const exists = data[personKey].some(w => w.date === workout.date && w.activity === workout.activity);
        if (!exists) {
          data[personKey].push(workout);
        }
      });
      
      // Sortuj po dacie (najnowsze na górze)
      data[personKey].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      saveTrainingData(data);
      statusDiv.innerHTML = `✅ Zaimportowano ${workouts.length} treningów`;
      
      setTimeout(() => {
        statusDiv.innerHTML = '';
      }, 3000);
      
    } catch (error) {
      console.error('Błąd parsowania CSV:', error);
      statusDiv.innerHTML = '❌ Błąd wczytywania pliku';
    }
  };
  
  reader.readAsText(file);
}

// Parser CSV Garmin Connect
function parseGarminCSV(csv) {
  const lines = csv.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const workouts = [];
  
  // Szukaj odpowiednich kolumn (różne wersje Garmin CSV)
  const dateIndex = headers.findIndex(h => h.includes('date') || h.includes('data'));
  const activityIndex = headers.findIndex(h => h.includes('activity') || h.includes('aktywność') || h.includes('type'));
  const timeIndex = headers.findIndex(h => h.includes('time') || h.includes('czas') || h.includes('duration'));
  const distanceIndex = headers.findIndex(h => h.includes('distance') || h.includes('dystans'));
  const caloriesIndex = headers.findIndex(h => h.includes('calorie') || h.includes('kalori'));
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    
    if (values.length > Math.max(dateIndex, activityIndex, timeIndex, distanceIndex, caloriesIndex)) {
      const workout = {
        date: dateIndex >= 0 ? values[dateIndex] : '',
        activity: activityIndex >= 0 ? values[activityIndex] : 'Trening',
        time: timeIndex >= 0 ? values[timeIndex] : '0',
        distance: distanceIndex >= 0 ? parseFloat(values[distanceIndex]) || 0 : 0,
        calories: caloriesIndex >= 0 ? parseInt(values[caloriesIndex]) || 0 : 0
      };
      
      if (workout.date && workout.calories > 0) {
        workouts.push(workout);
      }
    }
  }
  
  return workouts;
}

// Aktualizuj podsumowanie statystyk
function updateStatsSummary() {
  const data = getTrainingData();
  const allWorkouts = [...data.person1, ...data.person2];
  
  const totalWorkouts = allWorkouts.length;
  const totalCalories = allWorkouts.reduce((sum, w) => sum + w.calories, 0);
  const totalDistance = allWorkouts.reduce((sum, w) => sum + w.distance, 0);
  const totalTimeMinutes = allWorkouts.reduce((sum, w) => {
    // Konwersja czasu (może być w formacie HH:MM:SS lub minuty)
    if (typeof w.time === 'string' && w.time.includes(':')) {
      const parts = w.time.split(':');
      return sum + (parseInt(parts[0]) * 60) + parseInt(parts[1] || 0);
    }
    return sum + parseInt(w.time);
  }, 0);
  
  document.getElementById('totalWorkouts').textContent = totalWorkouts;
  document.getElementById('totalCalories').textContent = totalCalories.toLocaleString();
  document.getElementById('totalDistance').textContent = totalDistance.toFixed(1);
  document.getElementById('totalTime').textContent = (totalTimeMinutes / 60).toFixed(1);
}

// Wyświetl historię treningów
function displayTrainingHistory() {
  const data = getTrainingData();
  const container = document.getElementById('trainingHistoryList');
  
  if (!container) return;
  
  const allWorkouts = [
    ...data.person1.map(w => ({ ...w, person: 1 })),
    ...data.person2.map(w => ({ ...w, person: 2 }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (allWorkouts.length === 0) {
    container.innerHTML = '<p style="color: #666; text-align: center; padding: 30px;">Brak zaimportowanych treningów. Dodaj dane z plików CSV powyżej.</p>';
    return;
  }
  
  let html = '<table class="shopping-table"><thead><tr>';
  html += '<th>Data</th><th>Osoba</th><th>Aktywność</th><th>Czas</th><th>Dystans</th><th>Kalorie</th><th>Akcje</th>';
  html += '</tr></thead><tbody>';
  
  allWorkouts.forEach((workout, index) => {
    const personName = workout.person === 1 ? 
      (localStorage.getItem('person1Name') || 'Michalina') : 
      (localStorage.getItem('person2Name') || 'Marcin');
    
    html += '<tr>';
    html += `<td>${workout.date}</td>`;
    html += `<td>${personName}</td>`;
    html += `<td>${workout.activity}</td>`;
    html += `<td>${workout.time}</td>`;
    html += `<td>${workout.distance > 0 ? workout.distance.toFixed(2) + ' km' : '-'}</td>`;
    html += `<td>${workout.calories} kcal</td>`;
    html += `<td><button onclick="deleteWorkout(${workout.person}, '${workout.date}', '${workout.activity}')" class="btn-delete" style="font-size: 12px;">🗑️</button></td>`;
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  container.innerHTML = html;
  
  drawCaloriesChart(allWorkouts);
}

// Filtruj historię treningów
function filterTrainingHistory() {
  const data = getTrainingData();
  const filterPerson = document.getElementById('filterPerson').value;
  const filterActivity = document.getElementById('filterActivity').value;
  const filterDateFrom = document.getElementById('filterDateFrom').value;
  const filterDateTo = document.getElementById('filterDateTo').value;
  
  let allWorkouts = [
    ...data.person1.map(w => ({ ...w, person: 1 })),
    ...data.person2.map(w => ({ ...w, person: 2 }))
  ];
  
  // Filtruj po osobie
  if (filterPerson !== 'all') {
    allWorkouts = allWorkouts.filter(w => w.person === parseInt(filterPerson));
  }
  
  // Filtruj po aktywności
  if (filterActivity !== 'all') {
    allWorkouts = allWorkouts.filter(w => w.activity === filterActivity);
  }
  
  // Filtruj po dacie
  if (filterDateFrom) {
    allWorkouts = allWorkouts.filter(w => new Date(w.date) >= new Date(filterDateFrom));
  }
  if (filterDateTo) {
    allWorkouts = allWorkouts.filter(w => new Date(w.date) <= new Date(filterDateTo));
  }
  
  allWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const container = document.getElementById('trainingHistoryList');
  
  if (!container) return;
  
  if (allWorkouts.length === 0) {
    container.innerHTML = '<p style="color: #666; text-align: center; padding: 30px;">Brak treningów spełniających kryteria filtrów.</p>';
    return;
  }
  
  let html = '<table class="shopping-table"><thead><tr>';
  html += '<th>Data</th><th>Osoba</th><th>Aktywność</th><th>Czas</th><th>Dystans</th><th>Kalorie</th><th>Akcje</th>';
  html += '</tr></thead><tbody>';
  
  allWorkouts.forEach((workout) => {
    const personName = workout.person === 1 ? 
      (localStorage.getItem('person1Name') || 'Michalina') : 
      (localStorage.getItem('person2Name') || 'Marcin');
    
    html += '<tr>';
    html += `<td>${workout.date}</td>`;
    html += `<td>${personName}</td>`;
    html += `<td>${workout.activity}</td>`;
    html += `<td>${workout.time}</td>`;
    html += `<td>${workout.distance > 0 ? workout.distance.toFixed(2) + ' km' : '-'}</td>`;
    html += `<td>${workout.calories} kcal</td>`;
    html += `<td><button onclick="deleteWorkout(${workout.person}, '${workout.date}', '${workout.activity}')" class="btn-delete" style="font-size: 12px;">🗑️</button></td>`;
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  container.innerHTML = html;
  
  drawCaloriesChart(allWorkouts);
}

// Aktualizuj listę typów aktywności w filtrze
function updateActivityTypeFilter() {
  const data = getTrainingData();
  const allWorkouts = [...data.person1, ...data.person2];
  const activities = [...new Set(allWorkouts.map(w => w.activity))].sort();
  
  const select = document.getElementById('filterActivity');
  if (!select) return;
  
  const currentValue = select.value;
  
  select.innerHTML = '<option value="all">Wszystkie</option>';
  activities.forEach(activity => {
    const option = document.createElement('option');
    option.value = activity;
    option.textContent = activity;
    select.appendChild(option);
  });
  
  select.value = currentValue;
}

// Reset filtrów
function resetFilters() {
  document.getElementById('filterPerson').value = 'all';
  document.getElementById('filterActivity').value = 'all';
  document.getElementById('filterDateFrom').value = '';
  document.getElementById('filterDateTo').value = '';
  displayTrainingHistory();
}

// Usuń trening
function deleteWorkout(person, date, activity) {
  if (!confirm('Czy na pewno chcesz usunąć ten trening?')) return;
  
  const data = getTrainingData();
  const personKey = `person${person}`;
  
  data[personKey] = data[personKey].filter(w => !(w.date === date && w.activity === activity));
  
  saveTrainingData(data);
}

// Eksportuj wszystkie dane do CSV
function exportTrainingData() {
  const data = getTrainingData();
  const allWorkouts = [
    ...data.person1.map(w => ({ ...w, person: localStorage.getItem('person1Name') || 'Michalina' })),
    ...data.person2.map(w => ({ ...w, person: localStorage.getItem('person2Name') || 'Marcin' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (allWorkouts.length === 0) {
    alert('Brak danych do eksportu');
    return;
  }
  
  let csv = 'Data,Osoba,Aktywność,Czas,Dystans (km),Kalorie\n';
  allWorkouts.forEach(w => {
    csv += `${w.date},${w.person},${w.activity},${w.time},${w.distance},${w.calories}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `treningi_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

// Wyczyść wszystkie dane
function clearAllTrainingData() {
  if (!confirm('Czy na pewno chcesz usunąć WSZYSTKIE dane treningowe? Tej operacji nie można cofnąć!')) return;
  
  localStorage.removeItem('garminTrainingData');
  updateStatsSummary();
  displayTrainingHistory();
  updateActivityTypeFilter();
  alert('Wszystkie dane treningowe zostały usunięte');
}

// Wykres kalorii w czasie (prosty wykres ASCII/HTML)
function drawCaloriesChart(workouts) {
  const canvas = document.getElementById('caloriesChart');
  if (!canvas) return;
  
  if (workouts.length === 0) {
    canvas.style.display = 'none';
    return;
  }
  
  canvas.style.display = 'block';
  
  // Grupuj kalorie po dacie
  const caloriesByDate = {};
  workouts.forEach(w => {
    if (!caloriesByDate[w.date]) {
      caloriesByDate[w.date] = 0;
    }
    caloriesByDate[w.date] += w.calories;
  });
  
  const dates = Object.keys(caloriesByDate).sort();
  const calories = dates.map(d => caloriesByDate[d]);
  
  // Prosty wykres słupkowy HTML/CSS (zamiast canvas)
  const maxCalories = Math.max(...calories);
  let chartHTML = '<div style="display: flex; align-items: flex-end; height: 250px; gap: 5px; padding: 20px; background: #f9f9f9; border-radius: 8px;">';
  
  dates.slice(-30).forEach((date, i) => {
    const height = (calories[i] / maxCalories) * 200;
    const color = i % 2 === 0 ? '#007AFF' : '#34C759';
    chartHTML += `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
        <div style="width: 100%; background: ${color}; height: ${height}px; border-radius: 4px 4px 0 0; transition: height 0.3s;" title="${date}: ${calories[i]} kcal"></div>
        <div style="font-size: 10px; margin-top: 5px; transform: rotate(-45deg); white-space: nowrap;">${date.slice(5)}</div>
      </div>
    `;
  });
  
  chartHTML += '</div>';
  chartHTML += `<div style="text-align: center; margin-top: 10px; color: #666;">Pokazano ostatnie ${Math.min(30, dates.length)} treningów</div>`;
  
  // Zamień canvas na div
  const chartContainer = canvas.parentElement;
  canvas.remove();
  const newDiv = document.createElement('div');
  newDiv.id = 'caloriesChart';
  newDiv.innerHTML = chartHTML;
  chartContainer.appendChild(newDiv);
}

function displayCaloriesChart() {
  const data = getTrainingData();
  const allWorkouts = [
    ...data.person1.map(w => ({ ...w, person: 1 })),
    ...data.person2.map(w => ({ ...w, person: 2 }))
  ];
  drawCaloriesChart(allWorkouts);
}

function calculateBMI() {
  // Placeholder for BMI calculation
  console.log('BMI calculation not yet implemented');
}
