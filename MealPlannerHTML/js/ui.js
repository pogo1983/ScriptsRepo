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
