// ---------- ZMIENNE GLOBALNE ----------
let currentMealCount = 3;

// Bazowe wartości kalorii (do skalowania)
const BASE_CALORIES_MICHALINA = 1300;
const BASE_CALORIES_MARCIN = 2500;

let currentCaloriesMichalina = 1300;
let currentCaloriesMarcin = 2500;

const dni = ["Poniedziałek","Wtorek","Środa","Czwartek","Piątek","Sobota","Niedziela"];

// ---------- FUNKCJE POMOCNICZE ----------

// Funkcja skalowania gramatur
function scaleAmount(baseAmount, isForMarcin) {
  if(isForMarcin) {
    return Math.round(baseAmount * (currentCaloriesMarcin / BASE_CALORIES_MARCIN));
  } else {
    return Math.round(baseAmount * (currentCaloriesMichalina / BASE_CALORIES_MICHALINA));
  }
}

function updateCalories() {
  currentCaloriesMichalina = parseInt(document.getElementById('caloriesMichalina').value);
  currentCaloriesMarcin = parseInt(document.getElementById('caloriesMarcin').value);
  
  // Zapisz w localStorage
  localStorage.setItem('caloriesMichalina', currentCaloriesMichalina);
  localStorage.setItem('caloriesMarcin', currentCaloriesMarcin);
  
  // Odśwież wyświetlanie jeśli plan jest wygenerowany
  const planElement = document.getElementById('plan');
  if(planElement.innerHTML) {
    generujPlan();
  }
}

// Wczytaj zapisane kalorie
function loadSavedCalories() {
  const savedMichalina = localStorage.getItem('caloriesMichalina');
  const savedMarcin = localStorage.getItem('caloriesMarcin');
  
  if(savedMichalina) {
    currentCaloriesMichalina = parseInt(savedMichalina);
    document.getElementById('caloriesMichalina').value = savedMichalina;
  }
  
  if(savedMarcin) {
    currentCaloriesMarcin = parseInt(savedMarcin);
    document.getElementById('caloriesMarcin').value = savedMarcin;
  }
}

// ---------- TWORZENIE DROPDOWNÓW ----------

function createDropdowns() {
  const dropdowns = document.getElementById("dropdowns");
  let posilki = currentMealCount === 3 ? 
    ["śniadanie","obiad","kolacja"] : 
    ["śniadanie","obiad","podwieczorek","kolacja"];
  
  let posilkiLabels = {
    "śniadanie": "🌅 Śniadanie",
    "obiad": "🍴 Obiad",
    "podwieczorek": "🍎 Podwieczorek",
    "kolacja": "🌙 Kolacja"
  };
  
  let html = "<table><tr><th>Dzień</th>";
  posilki.forEach(p => {
    html += "<th>"+posilkiLabels[p]+"</th>";
  });
  html += "</tr>";
  
  for(let i=0;i<dni.length;i++){
    html += "<tr><td class='day-label'>"+dni[i]+"</td>";
    posilki.forEach(posilek=>{
      html += "<td><select id='"+posilek+i+"'>";
      if(dania[posilek]) {
        dania[posilek].forEach((d,j)=>{
          html+="<option value='"+j+"'>"+d.nazwa+"</option>";
        });
      }
      html+="</select></td>";
    });
    html+="</tr>";
  }
  html+="</table>";
  dropdowns.innerHTML = html;
  
  // Dodaj event listenery
  setTimeout(() => {
    wczytajWybor();
    for(let i=0; i<dni.length; i++){
      posilki.forEach(posilek => {
        const el = document.getElementById(posilek+i);
        if(el) el.addEventListener('change', zapiszWybor);
      });
    }
  }, 100);
}

// ---------- GENEROWANIE PLANU I SHOPPING LIST ----------

function generujPlan(){
  let posilki = currentMealCount === 3 ? 
    ["śniadanie","obiad","kolacja"] : 
    ["śniadanie","obiad","podwieczorek","kolacja"];
    
  let plan = "<div class='result-section'><h2>📅 Jadłospis na tydzień</h2><table><tr><th>Dzień</th><th>Posiłek</th><th class='person-michalina'>Michalina</th><th class='person-marcin'>Marcin</th></tr>";
  let zakupy = {}; // sumowanie składników
  
  for(let i=0;i<dni.length;i++){
    posilki.forEach(posilek=>{
      let idx = +document.getElementById(posilek+i).value;
      let d = dania[posilek][idx];
      
      let posilekDisplay = posilek === "śniadanie" ? "🌅 Śniadanie" : 
                          posilek === "obiad" ? "🍴 Obiad" : 
                          posilek === "podwieczorek" ? "🍎 Podwieczorek" : "🌙 Kolacja";
      
      plan+="<tr><td class='day-label'>"+dni[i]+"</td><td><b>"+d.nazwa+"</b></td><td class='person-michalina'>";
      let skladM = [], skladMA = [];
      
      for (const [skladnik,[gramM,gramMA]] of Object.entries(d.skladniki)){
        // Sprawdź czy to sztuki czy gramy
        let jednostka = skladnik === "Jajka" || skladnik.includes("Baton") ? "szt" : "g";
        
        // Przeskaluj gramatury według wybranego celu kalorycznego
        let scaledM = jednostka === "szt" ? gramM : scaleAmount(gramM, false);
        let scaledMA = jednostka === "szt" ? gramMA : scaleAmount(gramMA, true);
        
        skladM.push(skladnik+": "+scaledM+jednostka);
        skladMA.push(skladnik+": "+scaledMA+jednostka);
        
        // dodaj do listy zakupów
        zakupy[skladnik] = zakupy[skladnik] || {michalina:0, marcin:0, jednostka: jednostka};
        zakupy[skladnik].michalina += scaledM;
        zakupy[skladnik].marcin += scaledMA;
      }
      plan+=skladM.join(", ")+"</td><td class='person-marcin'>"+skladMA.join(", ")+"</td></tr>";
    });
  }
  plan+="</table></div>";

  // Generowanie listy zakupów
  let zakHTML = "<div class='result-section'><h2>🛒 Lista zakupów na tydzień</h2><table><tr><th>Produkt</th><th class='person-michalina'>Michalina</th><th class='person-marcin'>Marcin</th><th>RAZEM</th></tr>";
  
  // Sortuj alfabetycznie
  const sortedProducts = Object.keys(zakupy).sort();
  
  for(const prod of sortedProducts){
    const data = zakupy[prod];
    const suma = data.michalina + data.marcin;
    zakHTML+="<tr><td><b>"+prod+"</b></td><td class='person-michalina'>"+data.michalina+" "+data.jednostka+"</td><td class='person-marcin'>"+data.marcin+" "+data.jednostka+"</td><td><b>"+suma+" "+data.jednostka+"</b></td></tr>";
  }
  zakHTML+="</table></div>";

  document.getElementById("plan").innerHTML = plan;
  document.getElementById("zakupy").innerHTML = zakHTML;
  
  // Smooth scroll do wyników
  setTimeout(() => {
    document.getElementById("plan").scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// ---------- ZAPISYWANIE I WCZYTYWANIE ----------

function zapiszWybor() {
  const wybor = {};
  let posilki = currentMealCount === 3 ? 
    ["śniadanie","obiad","kolacja"] : 
    ["śniadanie","obiad","podwieczorek","kolacja"];
  
  for(let i=0; i<dni.length; i++){
    wybor[i] = {};
    posilki.forEach(posilek => {
      const el = document.getElementById(posilek+i);
      if(el) wybor[i][posilek] = el.value;
    });
  }
  localStorage.setItem('plannerWybor', JSON.stringify(wybor));
  localStorage.setItem('plannerMealCount', currentMealCount);
}

function wczytajWybor() {
  const zapisany = localStorage.getItem('plannerWybor');
  const savedMealCount = localStorage.getItem('plannerMealCount');
  
  if(savedMealCount) {
    currentMealCount = parseInt(savedMealCount);
    document.querySelector(`input[name="mealCount"][value="${currentMealCount}"]`).checked = true;
  }
  
  if(zapisany) {
    const wybor = JSON.parse(zapisany);
    let posilki = currentMealCount === 3 ? 
      ["śniadanie","obiad","kolacja"] : 
      ["śniadanie","obiad","podwieczorek","kolacja"];
    
    for(let i=0; i<dni.length; i++){
      if(wybor[i]) {
        posilki.forEach(posilek => {
          const el = document.getElementById(posilek+i);
          if(el && wybor[i][posilek] !== undefined) {
            el.value = wybor[i][posilek];
          }
        });
      }
    }
  }
}

function updateMealCount() {
  currentMealCount = parseInt(document.querySelector('input[name="mealCount"]:checked').value);
  createDropdowns();
  zapiszWybor();
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
  event.target.classList.add('active');
  
  if(tabName === 'manage') {
    displayDishList();
  }
}

// ---------- ZARZĄDZANIE DANIAMI ----------

function addNewDish() {
  const type = document.getElementById('newDishType').value;
  const name = document.getElementById('newDishName').value.trim();
  const recipe = document.getElementById('newDishRecipe').value.trim();
  const ingredientsText = document.getElementById('newDishIngredients').value.trim();
  
  if(!name) {
    alert('Proszę podać nazwę dania!');
    return;
  }
  
  if(!ingredientsText) {
    alert('Proszę podać składniki!');
    return;
  }
  
  try {
    // Parsuj składniki
    const ingredients = eval('(' + ingredientsText + ')');
    
    const newDish = {
      nazwa: name,
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
      html += `<h4 style="color: #236be8; margin-top: 20px;">${type.charAt(0).toUpperCase() + type.slice(1)}</h4>`;
      
      dania[type].forEach((dish, idx) => {
        html += `<div class="dish-item">`;
        html += `<h4>${dish.nazwa}</h4>`;
        
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

// ---------- INICJALIZACJA ----------

// Wczytaj przy starcie
loadCustomDishes();
loadSavedCalories();
createDropdowns();
