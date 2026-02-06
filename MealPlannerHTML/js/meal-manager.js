// ---------- ZARZĄDZANIE DANIAMI ----------

function addNewDish() {
  const type = document.getElementById('newDishType').value;
  const name = document.getElementById('newDishName').value.trim();
  const recipe = document.getElementById('newDishRecipe').value.trim();
  const ingredientsText = document.getElementById('newDishIngredients').value.trim();
  const calories = parseInt(document.getElementById('newDishCalories').value) || 0;
  
  if(!name) {
    alert('Proszę podać nazwę dania!');
    return;
  }
  
  if(!ingredientsText) {
    alert('Proszę podać składniki!');
    return;
  }
  
  if(!calories || calories <= 0) {
    alert('Proszę podać prawidłową wartość kalorii!');
    return;
  }
  
  try {
    // Parsuj składniki
    const ingredients = eval('(' + ingredientsText + ')');
    
    const newDish = {
      nazwa: name,
      kalorie: calories,
      skladniki: ingredients
    };
    
    if(recipe) {
      newDish.przepis = recipe;
    }
    
    // Dodaj do bazy
    if(!dania[type]) dania[type] = [];
    dania[type].push(newDish);
    
    // Zapisz w localStorage
    localStorage.setItem('daniaCustom', JSON.stringify(dania));
    
    // Wyczyść formularz
    document.getElementById('newDishName').value = '';
    document.getElementById('newDishRecipe').value = '';
    document.getElementById('newDishIngredients').value = '';
    document.getElementById('newDishCalories').value = '';
    
    alert('✅ Danie zostało dodane!');
    createDropdowns();
    displayDishList();
  } catch(e) {
    alert('❌ Błąd w formacie składników! Sprawdź składnię JSON.');
  }
}

function displayDishList() {
  let html = '';
  
  ['śniadanie', 'obiad', 'podwieczorek', 'kolacja'].forEach(type => {
    if(dania[type] && dania[type].length > 0) {
      html += `<h4 style="color: #1d1d1f; font-weight: 700; margin-top: 24px; margin-bottom: 16px; font-size: 1.2rem;">${type.charAt(0).toUpperCase() + type.slice(1)}</h4>`;
      
      dania[type].forEach((dish, idx) => {
        html += `<div class="dish-item">`;
        html += `<h4>${dish.nazwa}</h4>`;
        
        if(dish.kalorie) {
          const scaledCalories1 = Math.round(dish.kalorie * (currentCaloriesMichalina / BASE_CALORIES_MICHALINA));
          const scaledCalories2 = Math.round(dish.kalorie * (currentCaloriesMarcin / BASE_CALORIES_MARCIN));
          html += `<p style="color: #007AFF; font-weight: 600; font-size: 15px;">🔥 Kalorie: <span class="person-michalina">${scaledCalories1} kcal</span> / <span class="person-marcin">${scaledCalories2} kcal</span></p>`;
        }
        
        if(dish.przepis) {
          html += `<p><strong>Przepis:</strong> ${dish.przepis}</p>`;
        }
        
        html += `<p><strong>Składniki:</strong></p><ul>`;
        for(const [ingredient, [g1, g2]] of Object.entries(dish.skladniki)) {
          let jednostka = ingredient === "Jajka" || ingredient.includes("Baton") ? "szt" : "g";
          html += `<li>${ingredient}: <span class="person-michalina">${g1}${jednostka}</span> / <span class="person-marcin">${g2}${jednostka}</span></li>`;
        }
        html += `</ul>`;
        html += `<button class="btn-danger" onclick="deleteDish('${type}', ${idx})">🗑️ Usuń</button>`;
        html += `</div>`;
      });
    }
  });
  
  document.getElementById('dishList').innerHTML = html;
}

function deleteDish(type, index) {
  if(confirm('Czy na pewno chcesz usunąć to danie?')) {
    dania[type].splice(index, 1);
    localStorage.setItem('daniaCustom', JSON.stringify(dania));
    createDropdowns();
    displayDishList();
    alert('✅ Danie zostało usunięte!');
  }
}

// Wczytaj customowe dania z localStorage
function loadCustomDishes() {
  const customDishes = localStorage.getItem('daniaCustom');
  if(customDishes) {
    try {
      const parsed = JSON.parse(customDishes);
      // Merge z istniejącymi
      Object.keys(parsed).forEach(type => {
        if(parsed[type] && Array.isArray(parsed[type])) {
          dania[type] = parsed[type];
        }
      });
    } catch(e) {
      console.error('Błąd wczytywania customowych dań:', e);
    }
  }
}

// ---------- FUNKCJE RANDOMIZACJI I ZARZĄDZANIA PLANAMI ----------

function randomizujPlan() {
  if(!confirm('🎲 Czy na pewno chcesz wylosować dania na cały tydzień?\n\nObecny wybór zostanie nadpisany.')) {
    return;
  }
  
  let posilki = currentMealCount === 3 ? 
    ["śniadanie","obiad","kolacja"] : 
    ["śniadanie","obiad","podwieczorek","kolacja"];
  
  for(let i=0; i<dni.length; i++){
    posilki.forEach(posilek => {
      const el = document.getElementById(posilek+i);
      if(el && dania[posilek] && dania[posilek].length > 0) {
        const randomIndex = Math.floor(Math.random() * dania[posilek].length);
        el.value = randomIndex;
      }
    });
  }
  
  zapiszWybor();
  alert('✅ Plan został wylosowany! Możesz teraz wygenerować jadłospis.');
}

function resetujPlan() {
  if(!confirm('🔄 Czy na pewno chcesz zresetować plan?\n\nWszystkie posiłki zostaną ustawione na pierwsze pozycje z listy.')) {
    return;
  }
  
  let posilki = currentMealCount === 3 ? 
    ["śniadanie","obiad","kolacja"] : 
    ["śniadanie","obiad","podwieczorek","kolacja"];
  
  for(let i=0; i<dni.length; i++){
    posilki.forEach(posilek => {
      const el = document.getElementById(posilek+i);
      if(el) {
        el.value = 0;
      }
    });
  }
  
  zapiszWybor();
  alert('✅ Plan został zresetowany!');
}

function zapiszPlan() {
  const planName = prompt('💾 Podaj nazwę dla tego planu:', 'Plan ' + new Date().toLocaleDateString('pl-PL'));
  
  if(!planName) return;
  
  let posilki = currentMealCount === 3 ? 
    ["śniadanie","obiad","kolacja"] : 
    ["śniadanie","obiad","podwieczorek","kolacja"];
  
  const plan = {
    name: planName,
    date: new Date().toISOString(),
    mealCount: currentMealCount,
    meals: {}
  };
  
  for(let i=0; i<dni.length; i++){
    plan.meals[i] = {};
    posilki.forEach(posilek => {
      const el = document.getElementById(posilek+i);
      if(el) {
        plan.meals[i][posilek] = parseInt(el.value);
      }
    });
  }
  
  // Pobierz zapisane plany
  let savedPlans = JSON.parse(localStorage.getItem('savedMealPlans') || '[]');
  
  // Dodaj nowy plan
  savedPlans.push(plan);
  
  // Zapisz
  localStorage.setItem('savedMealPlans', JSON.stringify(savedPlans));
  
  alert('✅ Plan "' + planName + '" został zapisany!');
  displaySavedPlans();
}

function wczytajPlan(index) {
  if(!confirm('📂 Czy na pewno chcesz wczytać ten plan?\n\nObecny wybór zostanie nadpisany.')) {
    return;
  }
  
  const savedPlans = JSON.parse(localStorage.getItem('savedMealPlans') || '[]');
  
  if(index < 0 || index >= savedPlans.length) {
    alert('❌ Plan nie został znaleziony!');
    return;
  }
  
  const plan = savedPlans[index];
  
  // Ustaw liczbę posiłków
  if(plan.mealCount !== currentMealCount) {
    currentMealCount = plan.mealCount;
    document.querySelector(`input[name="mealCount"][value="${currentMealCount}"]`).checked = true;
    createDropdowns();
    
    // Czekaj na odświeżenie dropdownów
    setTimeout(() => {
      loadPlanData(plan);
    }, 200);
  } else {
    loadPlanData(plan);
  }
}

function loadPlanData(plan) {
  let posilki = plan.mealCount === 3 ? 
    ["śniadanie","obiad","kolacja"] : 
    ["śniadanie","obiad","podwieczorek","kolacja"];
  
  for(let i=0; i<dni.length; i++){
    if(plan.meals[i]) {
      posilki.forEach(posilek => {
        const el = document.getElementById(posilek+i);
        if(el && plan.meals[i][posilek] !== undefined) {
          el.value = plan.meals[i][posilek];
        }
      });
    }
  }
  
  zapiszWybor();
  alert('✅ Plan został wczytany!');
  toggleSavedPlans();
}

function usunPlan(index) {
  if(!confirm('🗑️ Czy na pewno chcesz usunąć ten plan?')) {
    return;
  }
  
  let savedPlans = JSON.parse(localStorage.getItem('savedMealPlans') || '[]');
  savedPlans.splice(index, 1);
  localStorage.setItem('savedMealPlans', JSON.stringify(savedPlans));
  
  displaySavedPlans();
  alert('✅ Plan został usunięty!');
}

function toggleSavedPlans() {
  const section = document.getElementById('savedPlansSection');
  const isVisible = section.style.display !== 'none';
  
  if(isVisible) {
    section.style.display = 'none';
  } else {
    section.style.display = 'block';
    displaySavedPlans();
  }
}

function displaySavedPlans() {
  const savedPlans = JSON.parse(localStorage.getItem('savedMealPlans') || '[]');
  const container = document.getElementById('savedPlansList');
  
  if(savedPlans.length === 0) {
    container.innerHTML = '<p style="color: #666; text-align: center;">Brak zapisanych planów. Zapisz obecny plan, aby móc go później wczytać.</p>';
    return;
  }
  
  let html = '';
  savedPlans.forEach((plan, index) => {
    const date = new Date(plan.date).toLocaleDateString('pl-PL', {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'});
    const mealCountText = plan.mealCount === 3 ? '3 posiłki' : '4 posiłki';
    
    html += `<div class="saved-plan-item">`;
    html += `<div>`;
    html += `<strong>${plan.name}</strong><br>`;
    html += `<small style="color: #666;">📅 ${date} | 🍽️ ${mealCountText}</small>`;
    html += `</div>`;
    html += `<div>`;
    html += `<button class="btn-secondary" onclick="wczytajPlan(${index})" style="margin-right: 5px;">📂 Wczytaj</button>`;
    html += `<button class="btn-danger" onclick="usunPlan(${index})">🗑️</button>`;
    html += `</div>`;
    html += `</div>`;
  });
  
  container.innerHTML = html;
}
