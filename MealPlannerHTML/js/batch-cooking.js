// ========================================
// BATCH COOKING - MNOŻNIK PORCJI
// Przygotuj większe ilości i propaguj na kolejne dni
// ========================================

// Pobierz ustawienia batch cooking
function getBatchMultipliers() {
  const saved = localStorage.getItem('batchMultipliers');
  return saved ? JSON.parse(saved) : {};
}

// Zapisz ustawienia batch cooking
function saveBatchMultipliers(multipliers) {
  localStorage.setItem('batchMultipliers', JSON.stringify(multipliers));
}

// Ustaw mnożnik dla dania
function setBatchMultiplier(day, mealType, multiplier) {
  const multipliers = getBatchMultipliers();
  const key = `${day}-${mealType}`;
  
  if (multiplier === 1) {
    delete multipliers[key];
  } else {
    multipliers[key] = multiplier;
  }
  
  saveBatchMultipliers(multipliers);
  generujPlan();
}

// Pobierz mnożnik dla dania
function getBatchMultiplier(day, mealType) {
  const multipliers = getBatchMultipliers();
  const key = `${day}-${mealType}`;
  return multipliers[key] || 1;
}

// Propaguj danie na kolejne dni (batch cooking)
function propagateBatchDish(day, mealType, multiplier) {
  if (multiplier <= 1) {
    alert('Wybierz mnożnik większy niż 1, aby propagować danie');
    return;
  }
  
  const daysToPropagate = multiplier - 1; // np. ×3 = propaguj na 2 kolejne dni
  const currentDishIndex = document.getElementById(mealType + day).value;
  
  let propagatedCount = 0;
  for (let i = 1; i <= daysToPropagate; i++) {
    const nextDay = day + i;
    if (nextDay < 7) { // tylko jeśli mieścimy się w tygodniu
      const nextDaySelect = document.getElementById(mealType + nextDay);
      if (nextDaySelect) {
        nextDaySelect.value = currentDishIndex;
        propagatedCount++;
      }
    }
  }
  
  if (propagatedCount > 0) {
    alert(`✅ Danie zostało skopiowane na ${propagatedCount} ${propagatedCount === 1 ? 'kolejny dzień' : 'kolejne dni'}!\n\nTeraz możesz wygenerować plan, aby zobaczyć zaktualizowane składniki.`);
  } else {
    alert('Nie można propagować - koniec tygodnia');
  }
}

// Wyczyść wszystkie batch multipliers
function clearAllBatchMultipliers() {
  if (confirm('Czy na pewno chcesz wyczyścić wszystkie mnożniki batch cooking?')) {
    localStorage.removeItem('batchMultipliers');
    generujPlan();
    alert('✅ Wszystkie mnożniki zostały wyczyszczone');
  }
}

// Generuj przyciski batch cooking dla dania
function generateBatchButtons(day, mealType) {
  const currentMultiplier = getBatchMultiplier(day, mealType);
  
  let html = '<div class="batch-cooking-controls">';
  html += '<span class="batch-label">Porcje:</span>';
  
  [1, 2, 3, 4].forEach(mult => {
    const isActive = currentMultiplier === mult;
    const btnClass = isActive ? 'batch-btn active' : 'batch-btn';
    html += `<button class="${btnClass}" onclick="setBatchMultiplier(${day}, '${mealType}', ${mult})" title="Pomnóż składniki ×${mult}">×${mult}</button>`;
  });
  
  // Przycisk propagacji (tylko jeśli mnożnik > 1)
  if (currentMultiplier > 1) {
    html += `<button class="batch-propagate-btn" onclick="propagateBatchDish(${day}, '${mealType}', ${currentMultiplier})" title="Skopiuj to danie na kolejne ${currentMultiplier - 1} dni">📋 Użyj na ${currentMultiplier - 1} ${currentMultiplier === 2 ? 'dzień' : 'dni'}</button>`;
  }
  
  html += '</div>';
  return html;
}

// Make functions globally available
window.setBatchMultiplier = setBatchMultiplier;
window.getBatchMultiplier = getBatchMultiplier;
window.propagateBatchDish = propagateBatchDish;
window.clearAllBatchMultipliers = clearAllBatchMultipliers;
window.generateBatchButtons = generateBatchButtons;
