// ========================================
// HISTORY - ZARZĄDZANIE HISTORIĄ PLANÓW
// ========================================

// ---------- ZAPISYWANIE DO HISTORII ----------

function saveCurrentPlanToHistory() {
  if (!fullPlanData || !fullPlanData.dayMealsData) {
    alert('Brak wygenerowanego planu do zapisania!');
    return;
  }
  
  // Pobierz nazwę planu od użytkownika
  const planName = prompt('Podaj nazwę dla tego planu (opcjonalnie):', `Plan ${new Date().toLocaleDateString('pl-PL')}`);
  
  if (planName === null) return; // Użytkownik anulował
  
  // Pobierz aktualny wybór dań z dropdownów
  const currentSelection = {};
  let posilki = currentMealCount === 3 ? 
    ["śniadanie","obiad","kolacja"] : 
    ["śniadanie","obiad","podwieczorek","kolacja"];
  
  for(let i=0; i<dni.length; i++){
    currentSelection[i] = {};
    posilki.forEach(posilek => {
      const el = document.getElementById(posilek+i);
      if(el) currentSelection[i][posilek] = el.value;
    });
  }
  
  // Stwórz obiekt historii
  const historyEntry = {
    id: Date.now(),
    name: planName || `Plan ${new Date().toLocaleDateString('pl-PL')}`,
    date: new Date().toISOString(),
    mealCount: currentMealCount,
    calories: {
      person1: currentCaloriesMichalina,
      person2: currentCaloriesMarcin
    },
    selection: currentSelection,
    totalCalories: {
      person1: fullPlanData.totalCalories1,
      person2: fullPlanData.totalCalories2
    }
  };
  
  // Pobierz historię z localStorage
  let history = JSON.parse(localStorage.getItem('mealPlanHistory') || '[]');
  
  // Dodaj nowy wpis na początek
  history.unshift(historyEntry);
  
  // Ogranicz do 50 ostatnich planów
  if (history.length > 50) {
    history = history.slice(0, 50);
  }
  
  // Zapisz
  localStorage.setItem('mealPlanHistory', JSON.stringify(history));
  
  alert('✅ Plan zapisany do historii!');
  
  // Odśwież listę jeśli jesteśmy w zakładce historii
  if (document.getElementById('history-tab').classList.contains('active')) {
    loadHistoryList();
  }
}

// ---------- ŁADOWANIE HISTORII ----------

function loadHistoryList() {
  const history = JSON.parse(localStorage.getItem('mealPlanHistory') || '[]');
  const historyList = document.getElementById('historyList');
  
  if (history.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: 40px; color: #666;">
        <div style="font-size: 64px; margin-bottom: 16px;">📋</div>
        <h3>Brak zapisanych planów</h3>
        <p>Wygeneruj plan tygodniowy i zapisz go do historii, aby móc go później wczytać.</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  
  history.forEach(entry => {
    const date = new Date(entry.date);
    const dateStr = date.toLocaleDateString('pl-PL');
    const timeStr = date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    
    const avgCal1 = Math.round(entry.totalCalories.person1.reduce((a,b) => a+b, 0) / 7);
    const avgCal2 = Math.round(entry.totalCalories.person2.reduce((a,b) => a+b, 0) / 7);
    
    html += `
      <div class="history-card">
        <div class="history-card-header">
          <h3>${entry.name}</h3>
          <span class="history-card-date">${dateStr} ${timeStr}</span>
        </div>
        <div class="history-card-info">
          <span>⏱️ ${entry.mealCount} posiłki/dzień</span>
          <span>📊 Średnio: <span class="person-michalina">${avgCal1}</span> / <span class="person-marcin">${avgCal2}</span> kcal/dzień</span>
        </div>
        <div class="history-card-actions">
          <button class="btn-secondary" onclick="loadPlanFromHistory(${entry.id})">📂 Wczytaj plan</button>
          <button class="btn-secondary" onclick="viewPlanDetails(${entry.id})">👁️ Podgląd</button>
          <button class="btn-danger" onclick="deletePlanFromHistory(${entry.id})">🗑️ Usuń</button>
        </div>
      </div>
    `;
  });
  
  historyList.innerHTML = html;
}

// ---------- WCZYTYWANIE PLANU Z HISTORII ----------

function loadPlanFromHistory(planId) {
  const history = JSON.parse(localStorage.getItem('mealPlanHistory') || '[]');
  const entry = history.find(h => h.id === planId);
  
  if (!entry) {
    alert('Nie znaleziono planu!');
    return;
  }
  
  // Ustaw liczbę posiłków
  currentMealCount = entry.mealCount;
  document.querySelector(`input[name="mealCount"][value="${currentMealCount}"]`).checked = true;
  updateMealCount();
  
  // Ustaw kalorie
  currentCaloriesMichalina = entry.calories.person1;
  currentCaloriesMarcin = entry.calories.person2;
  document.getElementById('caloriesMichalina').value = currentCaloriesMichalina;
  document.getElementById('caloriesMarcin').value = currentCaloriesMarcin;
  
  // Poczekaj na przeładowanie dropdownów
  setTimeout(() => {
    // Ustaw wybrane dania
    let posilki = currentMealCount === 3 ? 
      ["śniadanie","obiad","kolacja"] : 
      ["śniadanie","obiad","podwieczorek","kolacja"];
    
    for(let i=0; i<dni.length; i++){
      if(entry.selection[i]) {
        posilki.forEach(posilek => {
          const el = document.getElementById(posilek+i);
          if(el && entry.selection[i][posilek] !== undefined) {
            el.value = entry.selection[i][posilek];
          }
        });
      }
    }
    
    // Przełącz do zakładki planner
    switchTab('planner');
    
    alert('✅ Plan wczytany! Kliknij "Pokaż jadłospis" aby go wygenerować.');
  }, 300);
}

// ---------- USUWANIE Z HISTORII ----------

function deletePlanFromHistory(planId) {
  if (!confirm('Czy na pewno chcesz usunąć ten plan?')) {
    return;
  }
  
  let history = JSON.parse(localStorage.getItem('mealPlanHistory') || '[]');
  history = history.filter(h => h.id !== planId);
  localStorage.setItem('mealPlanHistory', JSON.stringify(history));
  
  loadHistoryList();
  alert('✅ Plan usunięty!');
}

// ---------- PODGLĄD PLANU ----------

function viewPlanDetails(planId) {
  const history = JSON.parse(localStorage.getItem('mealPlanHistory') || '[]');
  const entry = history.find(h => h.id === planId);
  
  if (!entry) {
    alert('Nie znaleziono planu!');
    return;
  }
  
  // Otwórz modal z podglądem (proste rozwiązanie - nowe okno)
  const detailsWindow = window.open('', '_blank', 'width=800,height=600');
  
  let html = `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>${entry.name} - Podgląd</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { color: #2196f3; }
    .day { margin: 20px 0; padding: 15px; border-left: 4px solid #667eea; background: #f9f9f9; }
    .meal { margin: 10px 0; }
    .person-michalina { color: #D70040; }
    .person-marcin { color: #0051D5; }
  </style>
</head>
<body>
  <h1>${entry.name}</h1>
  <p><strong>Data:</strong> ${new Date(entry.date).toLocaleString('pl-PL')}</p>
  <p><strong>Posiłki:</strong> ${entry.mealCount} dziennie</p>
  <p><strong>Cel kaloryczny:</strong> <span class="person-michalina">${entry.calories.person1} kcal</span> / <span class="person-marcin">${entry.calories.person2} kcal</span></p>
  <hr>
`;
  
  let posilki = entry.mealCount === 3 ? 
    ["śniadanie","obiad","kolacja"] : 
    ["śniadanie","obiad","podwieczorek","kolacja"];
  
  for(let i=0; i<dni.length; i++) {
    html += `<div class="day"><h3>${dni[i]}</h3>`;
    posilki.forEach(posilek => {
      const idx = entry.selection[i]?.[posilek];
      if (idx !== undefined && dania[posilek] && dania[posilek][idx]) {
        const danie = dania[posilek][idx];
        html += `<div class="meal"><strong>${posilek}:</strong> ${danie.nazwa}</div>`;
      }
    });
    html += `<p><strong>Razem:</strong> <span class="person-michalina">${entry.totalCalories.person1[i]} kcal</span> / <span class="person-marcin">${entry.totalCalories.person2[i]} kcal</span></p>`;
    html += `</div>`;
  }
  
  html += `</body></html>`;
  
  detailsWindow.document.write(html);
  detailsWindow.document.close();
}

// ---------- EKSPORT/IMPORT HISTORII ----------

function exportHistoryToJSON() {
  const history = JSON.parse(localStorage.getItem('mealPlanHistory') || '[]');
  
  if (history.length === 0) {
    alert('Brak historii do eksportu!');
    return;
  }
  
  const dataStr = JSON.stringify(history, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `meal_plan_history_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importHistoryFromJSON() {
  document.getElementById('historyFileInput').click();
}

function handleHistoryImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      
      if (!Array.isArray(imported)) {
        throw new Error('Nieprawidłowy format pliku');
      }
      
      // Połącz z istniejącą historią
      let existing = JSON.parse(localStorage.getItem('mealPlanHistory') || '[]');
      
      // Dodaj importowane, unikając duplikatów po ID
      const existingIds = new Set(existing.map(e => e.id));
      const newEntries = imported.filter(e => !existingIds.has(e.id));
      
      existing = [...newEntries, ...existing];
      
      // Ogranicz do 100
      if (existing.length > 100) {
        existing = existing.slice(0, 100);
      }
      
      localStorage.setItem('mealPlanHistory', JSON.stringify(existing));
      
      alert(`✅ Zaimportowano ${newEntries.length} nowych planów!`);
      loadHistoryList();
    } catch (error) {
      alert('❌ Błąd podczas importu: ' + error.message);
    }
  };
  reader.readAsText(file);
  
  // Reset input
  event.target.value = '';
}

// ---------- INIT ----------

// Załaduj historię przy otwarciu zakładki
document.addEventListener('DOMContentLoaded', () => {
  // Nasłuchuj na przełączanie zakładek
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.id === 'history-tab' && mutation.target.classList.contains('active')) {
        loadHistoryList();
      }
    });
  });
  
  const historyTab = document.getElementById('history-tab');
  if (historyTab) {
    observer.observe(historyTab, {
      attributes: true,
      attributeFilter: ['class']
    });
  }
});

// Make functions globally available for onclick handlers
window.saveCurrentPlanToHistory = saveCurrentPlanToHistory;
window.loadHistoryList = loadHistoryList;
window.loadPlanFromHistory = loadPlanFromHistory;
window.deletePlanFromHistory = deletePlanFromHistory;
window.viewPlanDetails = viewPlanDetails;
window.exportHistoryToJSON = exportHistoryToJSON;
window.importHistoryFromJSON = importHistoryFromJSON;
window.handleHistoryImport = handleHistoryImport;
