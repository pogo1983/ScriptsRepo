// ---------- ZMIENNE GLOBALNE ----------
let currentMealCount = 3;

// Bazowe wartości kalorii (do skalowania)
const BASE_CALORIES_MICHALINA = 1300;
const BASE_CALORIES_MARCIN = 2500;

let currentCaloriesMichalina = 1300;
let currentCaloriesMarcin = 2500;

// Imiona użytkowników (można edytować)
let namePerson1 = "Michalina";
let namePerson2 = "Marcin";

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

// Globalne zmienne dla pełnych danych planu
let fullPlanData = null;

function generujPlan(){
  let posilki = currentMealCount === 3 ? 
    ["śniadanie","obiad","kolacja"] : 
    ["śniadanie","obiad","podwieczorek","kolacja"];
    
  let plan = "<div class='result-section'><h2>📅 Jadłospis na tydzień</h2><table><tr><th>Dzień</th><th>Posiłek</th><th class='person-michalina'>" + namePerson1 + "</th><th class='person-marcin'>" + namePerson2 + "</th><th>Kalorie</th></tr>";
  let zakupy = {}; // sumowanie składników
  let totalCalories1 = Array(7).fill(0); // kalorie dla osoby 1 na każdy dzień
  let totalCalories2 = Array(7).fill(0); // kalorie dla osoby 2 na każdy dzień
  
  // Przechowaj szczegółowe dane dla każdego dnia
  let dayMealsData = [];
  
  for(let i=0;i<dni.length;i++){
    let dayMeals = [];
    posilki.forEach(posilek=>{
      const element = document.getElementById(posilek+i);
      if(!element) {
        console.error(`Element ${posilek}${i} nie istnieje!`);
        return;
      }
      let idx = +element.value;
      let d = dania[posilek][idx];
      if(!d) {
        console.error(`Danie nie istnieje dla ${posilek} indeks ${idx}`);
        return;
      }
      
      let posilekDisplay = posilek === "śniadanie" ? "🌅 Śniadanie" : 
                          posilek === "obiad" ? "🍴 Obiad" : 
                          posilek === "podwieczorek" ? "🍎 Podwieczorek" : "🌙 Kolacja";
      
      // Skaluj kalorie
      let caloriesScaled1 = d.kalorie ? Math.round(d.kalorie * (currentCaloriesMichalina / BASE_CALORIES_MICHALINA)) : 0;
      let caloriesScaled2 = d.kalorie ? Math.round(d.kalorie * (currentCaloriesMarcin / BASE_CALORIES_MARCIN)) : 0;
      totalCalories1[i] += caloriesScaled1;
      totalCalories2[i] += caloriesScaled2;
      
      plan+="<tr><td class='day-label'>"+dni[i]+"</td><td><b>"+d.nazwa+"</b></td><td class='person-michalina'>";
      let skladM = [], skladMA = [];
      
      // Zapisz dane posiłku do struktury dnia
      let mealData = {
        posilek: posilek,
        nazwa: d.nazwa,
        skladniki: {}
      };
      
      for (const [skladnik,[gramM,gramMA]] of Object.entries(d.skladniki)){
        // Sprawdź czy to sztuki czy gramy
        let jednostka = skladnik === "Jajka" || skladnik.includes("Baton") ? "szt" : "g";
        
        // Przeskaluj gramatury według wybranego celu kalorycznego
        let scaledM = jednostka === "szt" ? gramM : scaleAmount(gramM, false);
        let scaledMA = jednostka === "szt" ? gramMA : scaleAmount(gramMA, true);
        
        skladM.push(skladnik+": "+scaledM+jednostka);
        skladMA.push(skladnik+": "+scaledMA+jednostka);
        
        // Zapisz do struktury posiłku
        mealData.skladniki[skladnik] = {
          michalina: scaledM,
          marcin: scaledMA,
          jednostka: jednostka
        };
        
        // dodaj do listy zakupów
        zakupy[skladnik] = zakupy[skladnik] || {michalina:0, marcin:0, jednostka: jednostka};
        zakupy[skladnik].michalina += scaledM;
        zakupy[skladnik].marcin += scaledMA;
      }
      
      dayMeals.push(mealData);
      
      let calorieDisplay = "";
      if(d.kalorie) {
        calorieDisplay = `<span class='person-michalina'>${caloriesScaled1}</span> / <span class='person-marcin'>${caloriesScaled2}</span> kcal`;
      }
      
      plan+=skladM.join(", ")+"</td><td class='person-marcin'>"+skladMA.join(", ")+"</td><td style='text-align: center;'>"+calorieDisplay+"</td></tr>";
    });
    dayMealsData.push(dayMeals);
  }
  
  // Dodaj podsumowanie kalorii dziennych
  plan += "<tr style='background: #f0f7ff; font-weight: 700;'><td colspan='2' style='text-align: right; padding-right: 20px;'><b>Podsumowanie kalorii:</b></td><td class='person-michalina' style='text-align: center;'>";
  for(let i = 0; i < 7; i++) {
    if(i > 0) plan += " | ";
    plan += dni[i].substr(0,3) + ": " + totalCalories1[i] + " kcal";
  }
  plan += "</td><td class='person-marcin' style='text-align: center;'>";
  for(let i = 0; i < 7; i++) {
    if(i > 0) plan += " | ";
    plan += dni[i].substr(0,3) + ": " + totalCalories2[i] + " kcal";
  }
  plan += "</td><td></td></tr>";
  plan+="</table></div>";

  // Zapisz pełne dane planu globalnie
  fullPlanData = {
    dayMealsData: dayMealsData,
    totalCalories1: totalCalories1,
    totalCalories2: totalCalories2
  };

  // Generowanie listy zakupów dla wszystkich dni (domyślnie)
  generateShoppingList(zakupy, sortedProducts);

  document.getElementById("plan").innerHTML = plan;
  
  // Pokaż sekcję wyboru dni
  document.getElementById("zakupy-section").style.display = 'block';
  
  // Smooth scroll do wyników
  setTimeout(() => {
    document.getElementById("plan").scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function generateShoppingList(zakupy, sortedProducts) {
  // Sortuj alfabetycznie jeśli sortedProducts nie jest dostarczone
  if (!sortedProducts) {
    sortedProducts = Object.keys(zakupy).sort();
  }
  
  let zakHTML = "<div class='result-section'><h2>🛒 Lista zakupów</h2>";
  zakHTML += "<div class='export-buttons'>";
  zakHTML += "<button class='btn-export btn-excel' onclick='exportToExcel()'>📊 Eksportuj do Excel (CSV)</button>";
  zakHTML += "<button class='btn-export btn-print' onclick='printShoppingList()'>🖨️ Wydrukuj listę zakupów</button>";
  zakHTML += "</div>";
  
  // Sprawdź które dni są zaznaczone
  const selectedDays = getSelectedDays();
  const dayText = selectedDays.length === 7 ? "na cały tydzień" : 
                  `na wybrane dni: ${selectedDays.map(i => dni[i]).join(", ")}`;
  
  zakHTML += `<p style='margin: 10px 0; font-style: italic; color: #666;'>📅 ${dayText}</p>`;
  zakHTML += "<table id='shopping-table'><tr><th>Produkt</th><th class='person-michalina'>" + namePerson1 + "</th><th class='person-marcin'>" + namePerson2 + "</th><th>RAZEM</th></tr>";
  
  for(const prod of sortedProducts){
    const data = zakupy[prod];
    const suma = data.michalina + data.marcin;
    zakHTML+="<tr><td><b>"+prod+"</b></td><td class='person-michalina'>"+data.michalina+" "+data.jednostka+"</td><td class='person-marcin'>"+data.marcin+" "+data.jednostka+"</td><td><b>"+suma+" "+data.jednostka+"</b></td></tr>";
  }
  zakHTML+="</table></div>";

  document.getElementById("zakupy").innerHTML = zakHTML;
  
  // Zapisz dane zakupów globalnie dla eksportu
  window.currentShoppingList = {zakupy, sortedProducts, selectedDays};
}

// ---------- FILTROWANIE LISTY ZAKUPÓW ----------

function getSelectedDays() {
  const checkboxes = document.querySelectorAll('.day-checkbox');
  const selected = [];
  checkboxes.forEach(cb => {
    if(cb.checked) {
      selected.push(parseInt(cb.value));
    }
  });
  return selected;
}

function selectAllDays(checked) {
  const checkboxes = document.querySelectorAll('.day-checkbox');
  checkboxes.forEach(cb => {
    cb.checked = checked;
  });
}

function filterShoppingList() {
  if (!fullPlanData) {
    alert('Najpierw wygeneruj plan tygodniowy!');
    return;
  }
  
  const selectedDays = getSelectedDays();
  
  if (selectedDays.length === 0) {
    alert('Wybierz przynajmniej jeden dzień!');
    return;
  }
  
  // Przelicz składniki tylko dla wybranych dni
  let zakupy = {};
  
  selectedDays.forEach(dayIndex => {
    const dayMeals = fullPlanData.dayMealsData[dayIndex];
    
    dayMeals.forEach(meal => {
      for (const [skladnik, data] of Object.entries(meal.skladniki)) {
        zakupy[skladnik] = zakupy[skladnik] || {
          michalina: 0, 
          marcin: 0, 
          jednostka: data.jednostka
        };
        zakupy[skladnik].michalina += data.michalina;
        zakupy[skladnik].marcin += data.marcin;
      }
    });
  });
  
  // Sortuj alfabetycznie
  const sortedProducts = Object.keys(zakupy).sort();
  
  // Generuj nową listę zakupów
  generateShoppingList(zakupy, sortedProducts);
  
  // Scroll do listy zakupów
  setTimeout(() => {
    document.getElementById("zakupy").scrollIntoView({ behavior: 'smooth', block: 'start' });
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

// ---------- EKSPORT I WYDRUK ----------

function exportToExcel() {
  if(!window.currentShoppingList) {
    alert('❌ Najpierw wygeneruj listę zakupów!');
    return;
  }
  
  const {zakupy, sortedProducts, selectedDays} = window.currentShoppingList;
  
  // Informacja o wybranych dniach
  const dayText = selectedDays && selectedDays.length < 7 ? 
    `Dni: ${selectedDays.map(i => dni[i]).join(", ")}` : 
    "Dni: Cały tydzień";
  
  // Tworzenie CSV
  let csv = "\uFEFFProdukt;" + namePerson1 + ";" + namePerson2 + ";RAZEM\n"; // \uFEFF to BOM dla UTF-8
  
  for(const prod of sortedProducts){
    const data = zakupy[prod];
    const suma = data.michalina + data.marcin;
    csv += `${prod};${data.michalina} ${data.jednostka};${data.marcin} ${data.jednostka};${suma} ${data.jednostka}\n`;
  }
  
  // Dodaj podsumowanie
  csv += `\n\nWygenerowano: ${new Date().toLocaleDateString('pl-PL')} ${new Date().toLocaleTimeString('pl-PL')}\n`;
  csv += `${dayText}\n`;
  csv += `Cel kaloryczny - ${namePerson1}: ${currentCaloriesMichalina} kcal, ${namePerson2}: ${currentCaloriesMarcin} kcal\n`;
  
  // Tworzenie pliku do pobrania
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const fileName = `lista_zakupow_${new Date().toISOString().split('T')[0]}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  alert('✅ Lista zakupów została wyeksportowana do pliku CSV!\n\nMożesz otworzyć go w Excel lub Google Sheets.');
}

function printShoppingList() {
  if(!window.currentShoppingList) {
    alert('❌ Najpierw wygeneruj listę zakupów!');
    return;
  }
  
  // Otwórz okno wydruku
  window.print();
}

// ---------- INICJALIZACJA ----------

// Wczytaj przy starcie
loadCustomDishes();
loadSavedCalories();
loadSavedNames();
createDropdowns();
