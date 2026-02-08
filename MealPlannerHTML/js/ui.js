// ---------- ZARZĄDZANIE IMIONAMI ----------

function updateNames() {
  namePerson1 = document.getElementById('namePerson1').value.trim() || "Osoba 1";
  namePerson2 = document.getElementById('namePerson2').value.trim() || "Osoba 2";
  
  // Zapisz w localStorage
  localStorage.setItem('namePerson1', namePerson1);
  localStorage.setItem('namePerson2', namePerson2);
  
  // Aktualizuj etykiety na stronie
  updateNameLabels();
  
  alert('✅ Imiona zostały zapisane!');
}

function loadSavedNames() {
  const saved1 = localStorage.getItem('namePerson1');
  const saved2 = localStorage.getItem('namePerson2');
  
  if(saved1) {
    namePerson1 = saved1;
    const input = document.getElementById('namePerson1');
    if(input) input.value = saved1;
  }
  
  if(saved2) {
    namePerson2 = saved2;
    const input = document.getElementById('namePerson2');
    if(input) input.value = saved2;
  }
  
  updateNameLabels();
}

function updateNameLabels() {
  // Aktualizuj wszystkie miejsca gdzie pojawiają się imiona
  const person1Elements = document.querySelectorAll('.person-michalina-name');
  person1Elements.forEach(el => {
    el.textContent = namePerson1;
  });
  
  const person2Elements = document.querySelectorAll('.person-marcin-name');
  person2Elements.forEach(el => {
    el.textContent = namePerson2;
  });
  
  // Regeneruj dropdowns jeśli są widoczne
  const dropdowns = document.getElementById('dropdowns');
  if(dropdowns && dropdowns.innerHTML) {
    createDropdowns();
  }
  
  // Regeneruj plan jeśli jest widoczny
  const planElement = document.getElementById('plan');
  if(planElement.innerHTML) {
    generujPlan();
  }
}

// ---------- ZARZĄDZANIE ZAKŁADKAMI ----------

function switchTab(tabName) {
  // Ukryj wszystkie zakładki
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Pokaż wybraną zakładkę
  document.getElementById(tabName + '-tab').classList.add('active');
  
  // Zaznacz aktywny przycisk
  document.querySelectorAll('.tab').forEach(button => {
    if(button.textContent.includes(getTabIcon(tabName))) {
      button.classList.add('active');
    }
  });
  
  // Zamknij mobile menu po wyborze (jeśli otwarty)
  if (window.innerWidth <= 768) {
    closeMobileMenu();
  }
  
  // Inicjalizuj widoki przy przełączaniu
  if(tabName === 'manage') {
    displayDishList();
  } else if(tabName === 'activity') {
    displayActivityLog();
    displayWeightHistory();
    displayWaterProgress();
  } else if(tabName === 'fridge') {
    displayFridge();
    displayPrices();
  } else if(tabName === 'training') {
    displayTrainingPlanner();
  } else if(tabName === 'stats') {
    updateStatsSummary();
    displayTrainingHistory();
    updateActivityTypeFilter();
  }
}

function getTabIcon(tabName) {
  const icons = {
    'planner': '📅',
    'random': '🎲',
    'history': '📚',
    'activity': '🏃',
    'fridge': '🧊',
    'training': '💪',
    'stats': '📊',
    'manage': '⚙️'
  };
  return icons[tabName] || '';
}

// ---------- HAMBURGER MENU (Mobile) ----------

function toggleMobileMenu() {
  const hamburger = document.querySelector('.hamburger-menu');
  const tabs = document.querySelector('.tabs');
  const overlay = document.querySelector('.mobile-menu-overlay');
  
  hamburger.classList.toggle('active');
  tabs.classList.toggle('active');
  overlay.classList.toggle('active');
  
  // Prevent body scroll when menu is open
  if (tabs.classList.contains('active')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

function closeMobileMenu() {
  const hamburger = document.querySelector('.hamburger-menu');
  const tabs = document.querySelector('.tabs');
  const overlay = document.querySelector('.mobile-menu-overlay');
  
  hamburger.classList.remove('active');
  tabs.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ---------- AKTUALIZACJA LICZBY POSIŁKÓW ----------

function updateMealCount() {
  const selected = document.querySelector('input[name="mealCount"]:checked');
  currentMealCount = parseInt(selected.value);
  
  // Zapisz w localStorage
  localStorage.setItem('plannerMealCount', currentMealCount);
  
  // Odśwież dropdowny
  createDropdowns();
  
  // Wyczyść poprzedni plan
  document.getElementById('plan').innerHTML = '';
  document.getElementById('zakupy').innerHTML = '';
}

// ---------- ZARZĄDZANIE FUNKCJĄ ULUBIONYCH ----------

function toggleFavoritesFeature() {
  const enabled = document.getElementById('enableFavoritesFeature').checked;
  
  // Zapisz ustawienie
  localStorage.setItem('favoritesFeatureEnabled', enabled);
  
  // Pokaż/ukryj filtr w zakładce planner
  const filterContainer = document.getElementById('favorites-filter-container');
  if (filterContainer) {
    filterContainer.style.display = enabled ? 'block' : 'none';
  }
  
  // Odśwież listę dań aby zaktualizować gwiazdki
  if (typeof displayDishList === 'function') {
    displayDishList();
  }
  
  // Odśwież dropdowny jeśli filtr był aktywny
  const showOnlyFavorites = document.getElementById('showOnlyFavorites');
  if (showOnlyFavorites && showOnlyFavorites.checked && !enabled) {
    showOnlyFavorites.checked = false;
    if (typeof createDropdowns === 'function') {
      createDropdowns();
    }
  }
}

function loadFavoritesFeatureSetting() {
  const enabled = localStorage.getItem('favoritesFeatureEnabled') === 'true';
  const checkbox = document.getElementById('enableFavoritesFeature');
  if (checkbox) {
    checkbox.checked = enabled;
  }
  
  // Pokaż/ukryj filtr
  const filterContainer = document.getElementById('favorites-filter-container');
  if (filterContainer) {
    filterContainer.style.display = enabled ? 'block' : 'none';
  }
}

// ---------- ZARZĄDZANIE FUNKCJĄ HISTORII ----------

function toggleHistoryFeature() {
  const enabled = document.getElementById('enableHistoryFeature').checked;
  
  // Zapisz ustawienie
  localStorage.setItem('historyFeatureEnabled', enabled);
  
  // Pokaż/ukryj zakładkę Historia
  const historyBtn = document.getElementById('history-tab-btn');
  if (historyBtn) {
    historyBtn.style.display = enabled ? 'inline-block' : 'none';
  }
  
  // Jeśli wyłączamy i jesteśmy na tej zakładce, przejdź do Planner
  const historyTab = document.getElementById('history-tab');
  if (!enabled && historyTab && historyTab.classList.contains('active')) {
    switchTab('planner');
  }
}

function loadHistoryFeatureSetting() {
  const enabled = localStorage.getItem('historyFeatureEnabled') === 'true'; // domyślnie wyłączone
  const checkbox = document.getElementById('enableHistoryFeature');
  if (checkbox) {
    checkbox.checked = enabled;
  }
  
  // Pokaż/ukryj zakładkę
  const historyBtn = document.getElementById('history-tab-btn');
  if (historyBtn) {
    historyBtn.style.display = enabled ? 'inline-block' : 'none';
  }
}

// ---------- ZARZĄDZANIE FUNKCJĄ STATYSTYK ----------

function toggleStatsFeature() {
  const enabled = document.getElementById('enableStatsFeature').checked;
  
  // Zapisz ustawienie
  localStorage.setItem('statsFeatureEnabled', enabled);
  
  // Pokaż/ukryj zakładkę Statystyki
  const statsBtn = document.getElementById('stats-tab-btn');
  if (statsBtn) {
    statsBtn.style.display = enabled ? 'inline-block' : 'none';
  }
  
  // Jeśli wyłączamy i jesteśmy na tej zakładce, przejdź do Planner
  const statsTab = document.getElementById('stats-tab');
  if (!enabled && statsTab && statsTab.classList.contains('active')) {
    switchTab('planner');
  }
}

function loadStatsFeatureSetting() {
  const enabled = localStorage.getItem('statsFeatureEnabled') === 'true'; // domyślnie wyłączone
  const checkbox = document.getElementById('enableStatsFeature');
  if (checkbox) {
    checkbox.checked = enabled;
  }
  
  // Pokaż/ukryj zakładkę
  const statsBtn = document.getElementById('stats-tab-btn');
  if (statsBtn) {
    statsBtn.style.display = enabled ? 'inline-block' : 'none';
  }
}

// ---------- ZARZĄDZANIE FUNKCJĄ AKTYWNOŚCI ----------

function toggleActivityFeature() {
  const enabled = document.getElementById('enableActivityFeature').checked;
  
  // Zapisz ustawienie
  localStorage.setItem('activityFeatureEnabled', enabled);
  
  // Pokaż/ukryj zakładkę Aktywność
  const activityBtn = document.getElementById('activity-tab-btn');
  if (activityBtn) {
    activityBtn.style.display = enabled ? 'inline-block' : 'none';
  }
  
  // Jeśli wyłączamy i jesteśmy na tej zakładce, przejdź do Planner
  const activityTab = document.getElementById('activity-tab');
  if (!enabled && activityTab && activityTab.classList.contains('active')) {
    switchTab('planner');
  }
}

function loadActivityFeatureSetting() {
  const enabled = localStorage.getItem('activityFeatureEnabled') === 'true'; // domyślnie wyłączone
  const checkbox = document.getElementById('enableActivityFeature');
  if (checkbox) {
    checkbox.checked = enabled;
  }
  
  // Pokaż/ukryj zakładkę
  const activityBtn = document.getElementById('activity-tab-btn');
  if (activityBtn) {
    activityBtn.style.display = enabled ? 'inline-block' : 'none';
  }
}

// ---------- ZARZĄDZANIE FUNKCJĄ LODÓWKI ----------

function toggleFridgeFeature() {
  const enabled = document.getElementById('enableFridgeFeature').checked;
  
  // Zapisz ustawienie
  localStorage.setItem('fridgeFeatureEnabled', enabled);
  
  // Pokaż/ukryj zakładkę Lodówka
  const fridgeBtn = document.getElementById('fridge-tab-btn');
  if (fridgeBtn) {
    fridgeBtn.style.display = enabled ? 'inline-block' : 'none';
  }
  
  // Jeśli wyłączamy i jesteśmy na tej zakładce, przejdź do Planner
  const fridgeTab = document.getElementById('fridge-tab');
  if (!enabled && fridgeTab && fridgeTab.classList.contains('active')) {
    switchTab('planner');
  }
}

function loadFridgeFeatureSetting() {
  const enabled = localStorage.getItem('fridgeFeatureEnabled') === 'true'; // domyślnie wyłączone
  const checkbox = document.getElementById('enableFridgeFeature');
  if (checkbox) {
    checkbox.checked = enabled;
  }
  
  // Pokaż/ukryj zakładkę
  const fridgeBtn = document.getElementById('fridge-tab-btn');
  if (fridgeBtn) {
    fridgeBtn.style.display = enabled ? 'inline-block' : 'none';
  }
}

// Make functions globally available
window.toggleFavoritesFeature = toggleFavoritesFeature;
window.loadFavoritesFeatureSetting = loadFavoritesFeatureSetting;
window.toggleHistoryFeature = toggleHistoryFeature;
window.loadHistoryFeatureSetting = loadHistoryFeatureSetting;
window.toggleStatsFeature = toggleStatsFeature;
window.loadStatsFeatureSetting = loadStatsFeatureSetting;
window.toggleActivityFeature = toggleActivityFeature;
window.loadActivityFeatureSetting = loadActivityFeatureSetting;
window.toggleFridgeFeature = toggleFridgeFeature;
window.loadFridgeFeatureSetting = loadFridgeFeatureSetting;
