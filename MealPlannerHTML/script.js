// ---------- ZMIENNE GLOBALNE ----------
let currentMealCount = 3;

// Bazowe wartości kalorii (odpowiadają domyślnym celom kalorycznym)
// Kalorie w bazie dań są podane dla jednej porcji (Michaliny)
// Marcin ma ~1.6-1.9x większe gramatury, więc jego baza jest odpowiednio wyższa
const BASE_CALORIES_MICHALINA = 1300;
const BASE_CALORIES_MARCIN = 2500; // Uwzględnia średni stosunek gramatur (1.92x)

let currentCaloriesMichalina = 1300;
let currentCaloriesMarcin = 2000;

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
      
      // Oblicz kalorie proporcjonalnie do gramatur składników
      // Dla Michaliny używamy pierwszej gramatury, dla Marcina drugiej
      let totalGramsMichalina = 0;
      let totalGramsMarcin = 0;
      
      for (const [skladnik,[gramM,gramMA]] of Object.entries(d.skladniki)){
        let jednostka = skladnik === "Jajka" || skladnik.includes("Baton") ? "szt" : "g";
        if (jednostka === "g") {
          totalGramsMichalina += gramM;
          totalGramsMarcin += gramMA;
        }
      }
      
      // Oblicz stosunek gramatur (jeśli składniki w gramach)
      let gramsRatio = totalGramsMarcin > 0 ? totalGramsMarcin / totalGramsMichalina : 1.5;
      
      // Skaluj kalorie bazowe według wybranego celu i proporcji gramatur
      let baseCaloriesForMichalina = d.kalorie || 0;
      let baseCaloriesForMarcin = Math.round((d.kalorie || 0) * gramsRatio);
      
      let caloriesScaled1 = Math.round(baseCaloriesForMichalina * (currentCaloriesMichalina / BASE_CALORIES_MICHALINA));
      let caloriesScaled2 = Math.round(baseCaloriesForMarcin * (currentCaloriesMarcin / BASE_CALORIES_MARCIN));
      
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
  
  // Dodaj podsumowanie kalorii dziennych - osobne wiersze dla każdej osoby
  plan += "<tr style='background: #f0f7ff; font-weight: 700;'><td colspan='2' style='text-align: right; padding-right: 20px;'><b>Suma kalorii - " + namePerson1 + ":</b></td><td colspan='3' class='person-michalina' style='text-align: left; padding-left: 20px;'>";
  for(let i = 0; i < 7; i++) {
    if(i > 0) plan += " | ";
    plan += dni[i].substr(0,3) + ": " + totalCalories1[i] + " kcal";
  }
  plan += "</td></tr>";
  
  plan += "<tr style='background: #e3f2fd; font-weight: 700;'><td colspan='2' style='text-align: right; padding-right: 20px;'><b>Suma kalorii - " + namePerson2 + ":</b></td><td colspan='3' class='person-marcin' style='text-align: left; padding-left: 20px;'>";
  for(let i = 0; i < 7; i++) {
    if(i > 0) plan += " | ";
    plan += dni[i].substr(0,3) + ": " + totalCalories2[i] + " kcal";
  }
  plan += "</td></tr>";
  plan+="</table></div>";

  // Zapisz pełne dane planu globalnie
  fullPlanData = {
    dayMealsData: dayMealsData,
    totalCalories1: totalCalories1,
    totalCalories2: totalCalories2
  };

  // Sortuj produkty alfabetycznie
  const sortedProducts = Object.keys(zakupy).sort();

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
  
  // Zaznacz aktywny przycisk
  document.querySelectorAll('.tab').forEach(button => {
    if(button.textContent.includes(getTabIcon(tabName))) {
      button.classList.add('active');
    }
  });
  
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
    'activity': '🏃',
    'fridge': '🧊',
    'training': '💪',
    'stats': '📊',
    'manage': '⚙️'
  };
  return icons[tabName] || '';
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

// ---------- WAGA ----------

function saveWeight() {
  const person = document.getElementById('weightPerson').value;
  const date = document.getElementById('weightDate').value;
  const weight = parseFloat(document.getElementById('weightValue').value);
  
  if(!date || !weight) {
    alert('Wypełnij wszystkie pola!');
    return;
  }
  
  const personName = person === 'person1' ? namePerson1 : namePerson2;
  let weights = JSON.parse(localStorage.getItem('weights') || '[]');
  
  weights.push({
    person: person,
    personName: personName,
    date: date,
    weight: weight
  });
  
  weights.sort((a, b) => new Date(b.date) - new Date(a.date));
  localStorage.setItem('weights', JSON.stringify(weights));
  
  alert('✅ Waga zapisana!');
  displayWeightHistory();
  document.getElementById('weightValue').value = '';
}

function displayWeightHistory() {
  const weights = JSON.parse(localStorage.getItem('weights') || '[]');
  const historyDiv = document.getElementById('weightHistory');
  
  if(weights.length === 0) {
    historyDiv.innerHTML = '<p style="color: #666; font-style: italic;">Brak zapisanych pomiarów</p>';
    return;
  }
  
  let html = '<h4>📈 Historia pomiarów:</h4>';
  
  // Pogrupuj po osobach
  const person1Weights = weights.filter(w => w.person === 'person1');
  const person2Weights = weights.filter(w => w.person === 'person2');
  
  if(person1Weights.length > 0) {
    html += `<h5 class="person-michalina">${namePerson1}</h5>`;
    person1Weights.slice(0, 10).forEach((w, idx) => {
      const trend = idx < person1Weights.length - 1 ? 
        (w.weight < person1Weights[idx + 1].weight ? '📉 ' : w.weight > person1Weights[idx + 1].weight ? '📈 ' : '➡️ ') : '';
      html += `
        <div class="weight-entry">
          <span>${trend}${w.date}: <strong>${w.weight} kg</strong></span>
          <button class="weight-delete" onclick="deleteWeight(${weights.indexOf(w)})">❌</button>
        </div>
      `;
    });
  }
  
  if(person2Weights.length > 0) {
    html += `<h5 class="person-marcin">${namePerson2}</h5>`;
    person2Weights.slice(0, 10).forEach((w, idx) => {
      const trend = idx < person2Weights.length - 1 ? 
        (w.weight < person2Weights[idx + 1].weight ? '📉 ' : w.weight > person2Weights[idx + 1].weight ? '📈 ' : '➡️ ') : '';
      html += `
        <div class="weight-entry">
          <span>${trend}${w.date}: <strong>${w.weight} kg</strong></span>
          <button class="weight-delete" onclick="deleteWeight(${weights.indexOf(w)})">❌</button>
        </div>
      `;
    });
  }
  
  historyDiv.innerHTML = html;
}

function deleteWeight(idx) {
  let weights = JSON.parse(localStorage.getItem('weights') || '[]');
  weights.splice(idx, 1);
  localStorage.setItem('weights', JSON.stringify(weights));
  displayWeightHistory();
}

// ---------- TRACKER WODY ----------

function addWater(amount) {
  const person = document.getElementById('waterPerson').value;
  const today = new Date().toISOString().split('T')[0];
  
  let waterData = JSON.parse(localStorage.getItem('waterData') || '{}');
  const key = `${person}_${today}`;
  
  waterData[key] = (waterData[key] || 0) + amount;
  localStorage.setItem('waterData', JSON.stringify(waterData));
  
  displayWaterProgress();
}

function resetWater() {
  const person = document.getElementById('waterPerson').value;
  const today = new Date().toISOString().split('T')[0];
  
  let waterData = JSON.parse(localStorage.getItem('waterData') || '{}');
  const key = `${person}_${today}`;
  
  delete waterData[key];
  localStorage.setItem('waterData', JSON.stringify(waterData));
  
  displayWaterProgress();
}

function displayWaterProgress() {
  const person = document.getElementById('waterPerson').value;
  const goal = parseFloat(document.getElementById('waterGoal').value);
  const today = new Date().toISOString().split('T')[0];
  
  let waterData = JSON.parse(localStorage.getItem('waterData') || '{}');
  const key = `${person}_${today}`;
  const current = waterData[key] || 0;
  
  const percentage = Math.min((current / goal) * 100, 100);
  const personName = person === 'person1' ? namePerson1 : namePerson2;
  
  const progressDiv = document.getElementById('waterProgress');
  progressDiv.innerHTML = `
    <h4>${personName} - Dziś: ${current.toFixed(2)}L / ${goal}L</h4>
    <div class="water-progress-bar">
      <div class="water-progress-fill" style="width: ${percentage}%">
        ${percentage.toFixed(0)}%
      </div>
    </div>
    <p style="margin-top: 10px; color: #666;">
      ${current >= goal ? '🎉 Cel osiągnięty!' : `💧 Pozostało: ${(goal - current).toFixed(2)}L`}
    </p>
  `;
}

// ---------- LODÓWKA ----------

function addToFridge() {
  const product = document.getElementById('fridgeProduct').value.trim();
  const amount = parseFloat(document.getElementById('fridgeAmount').value);
  const unit = document.getElementById('fridgeUnit').value;
  const expiry = document.getElementById('fridgeExpiry').value;
  
  if(!product || !amount) {
    alert('Wypełnij nazwę i ilość!');
    return;
  }
  
  let fridge = JSON.parse(localStorage.getItem('fridge') || '[]');
  
  fridge.push({
    product: product,
    amount: amount,
    unit: unit,
    expiry: expiry,
    addedDate: new Date().toISOString().split('T')[0]
  });
  
  localStorage.setItem('fridge', JSON.stringify(fridge));
  
  alert('✅ Dodano do lodówki!');
  displayFridge();
  
  document.getElementById('fridgeProduct').value = '';
  document.getElementById('fridgeAmount').value = '';
  document.getElementById('fridgeExpiry').value = '';
}

function displayFridge() {
  const fridge = JSON.parse(localStorage.getItem('fridge') || '[]');
  const listDiv = document.getElementById('fridgeList');
  
  if(fridge.length === 0) {
    listDiv.innerHTML = '<p style="color: #666; font-style: italic;">Lodówka jest pusta</p>';
    return;
  }
  
  const today = new Date();
  let html = '<h4>📦 Zawartość lodówki:</h4>';
  
  fridge.forEach((item, idx) => {
    let expiryClass = '';
    let expiryText = '';
    
    if(item.expiry) {
      const expiryDate = new Date(item.expiry);
      const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      if(daysLeft < 0) {
        expiryClass = 'expired';
        expiryText = `⚠️ Przeterminowane ${Math.abs(daysLeft)} dni temu`;
      } else if(daysLeft <= 3) {
        expiryClass = 'expiring';
        expiryText = `⏰ Ważne jeszcze ${daysLeft} dni`;
      } else {
        expiryText = `Ważne do: ${item.expiry}`;
      }
    }
    
    html += `
      <div class="fridge-item ${expiryClass}">
        <div>
          <strong>${item.product}</strong>: ${item.amount} ${item.unit}<br>
          <small>${expiryText}</small>
        </div>
        <button class="fridge-delete" onclick="deleteFromFridge(${idx})">❌</button>
      </div>
    `;
  });
  
  listDiv.innerHTML = html;
}

function deleteFromFridge(idx) {
  let fridge = JSON.parse(localStorage.getItem('fridge') || '[]');
  fridge.splice(idx, 1);
  localStorage.setItem('fridge', JSON.stringify(fridge));
  displayFridge();
}

function suggestDishes() {
  const fridge = JSON.parse(localStorage.getItem('fridge') || '[]');
  const suggestionsDiv = document.getElementById('dishSuggestions');
  
  if(fridge.length === 0) {
    suggestionsDiv.innerHTML = '<p style="color: #666;">Dodaj produkty do lodówki!</p>';
    return;
  }
  
  const fridgeProducts = fridge.map(item => item.product.toLowerCase());
  const suggestions = [];
  
  // Sprawdź wszystkie dania
  ['śniadanie', 'obiad', 'kolacja', 'podwieczorek'].forEach(mealType => {
    if(dania[mealType]) {
      dania[mealType].forEach(dish => {
        const dishIngredients = Object.keys(dish.skladniki).map(ing => ing.toLowerCase());
        const matchCount = dishIngredients.filter(ing => 
          fridgeProducts.some(fp => fp.includes(ing) || ing.includes(fp))
        ).length;
        
        if(matchCount > 0) {
          suggestions.push({
            name: dish.nazwa,
            type: mealType,
            matchCount: matchCount,
            totalIngredients: dishIngredients.length,
            matchPercent: Math.round((matchCount / dishIngredients.length) * 100)
          });
        }
      });
    }
  });
  
  suggestions.sort((a, b) => b.matchPercent - a.matchPercent);
  
  let html = '<h4>💡 Sugerowane dania:</h4>';
  
  if(suggestions.length === 0) {
    html += '<p style="color: #666;">Brak pasujących dań :(</p>';
  } else {
    suggestions.slice(0, 10).forEach(sug => {
      html += `
        <div class="fridge-item">
          <div>
            <strong>${sug.name}</strong> (${sug.type})<br>
            <small>Masz ${sug.matchCount}/${sug.totalIngredients} składników (${sug.matchPercent}%)</small>
          </div>
        </div>
      `;
    });
  }
  
  suggestionsDiv.innerHTML = html;
}

// ---------- CENY PRODUKTÓW ----------

function savePrice() {
  const product = document.getElementById('priceProduct').value.trim();
  const price = parseFloat(document.getElementById('priceValue').value);
  const shop = document.getElementById('priceShop').value.trim();
  
  if(!product || !price) {
    alert('Wypełnij nazwę produktu i cenę!');
    return;
  }
  
  let prices = JSON.parse(localStorage.getItem('prices') || '{}');
  
  prices[product] = {
    price: price,
    shop: shop || 'Nieznany',
    updated: new Date().toISOString().split('T')[0]
  };
  
  localStorage.setItem('prices', JSON.stringify(prices));
  
  alert('✅ Cena zapisana!');
  displayPrices();
  
  document.getElementById('priceProduct').value = '';
  document.getElementById('priceValue').value = '';
  document.getElementById('priceShop').value = '';
}

function displayPrices() {
  const prices = JSON.parse(localStorage.getItem('prices') || '{}');
  const listDiv = document.getElementById('priceList');
  
  const priceEntries = Object.entries(prices);
  
  if(priceEntries.length === 0) {
    listDiv.innerHTML = '<p style="color: #666; font-style: italic;">Brak zapisanych cen</p>';
    return;
  }
  
  let html = '<h4>💰 Zapisane ceny:</h4>';
  
  priceEntries.sort((a, b) => a[0].localeCompare(b[0])).forEach(([product, data]) => {
    html += `
      <div class="price-item">
        <div>
          <strong>${product}</strong>: ${data.price.toFixed(2)} zł/100g<br>
          <small>${data.shop} • ${data.updated}</small>
        </div>
        <button class="price-delete" onclick="deletePrice('${product}')">❌</button>
      </div>
    `;
  });
  
  listDiv.innerHTML = html;
}

function deletePrice(product) {
  let prices = JSON.parse(localStorage.getItem('prices') || '{}');
  delete prices[product];
  localStorage.setItem('prices', JSON.stringify(prices));
  displayPrices();
}

// ---------- TRENING ----------

function saveTraining() {
  const day = parseInt(document.getElementById('trainingDay').value);
  const person = document.getElementById('trainingPerson').value;
  const type = document.getElementById('trainingType').value;
  const name = document.getElementById('trainingName').value.trim();
  const time = parseInt(document.getElementById('trainingTime').value);
  
  if(!name || !time) {
    alert('Wypełnij nazwę i czas treningu!');
    return;
  }
  
  let trainings = JSON.parse(localStorage.getItem('trainings') || '{}');
  
  if(!trainings[day]) trainings[day] = [];
  
  trainings[day].push({
    person: person,
    type: type,
    name: name,
    time: time
  });
  
  localStorage.setItem('trainings', JSON.stringify(trainings));
  
  alert('✅ Trening dodany do planu!');
  displayTrainingPlanner();
  
  document.getElementById('trainingName').value = '';
  document.getElementById('trainingTime').value = '';
}

function displayTrainingPlanner() {
  const trainings = JSON.parse(localStorage.getItem('trainings') || '{}');
  const plannerDiv = document.getElementById('trainingPlanner');
  
  let html = '';
  
  dni.forEach((day, idx) => {
    html += `<div class="training-day"><strong>${day}</strong>`;
    
    if(trainings[idx] && trainings[idx].length > 0) {
      trainings[idx].forEach((training, tIdx) => {
        const personName = training.person === 'person1' ? namePerson1 : 
                          training.person === 'person2' ? namePerson2 : 'Oboje';
        html += `
          <div class="training-item">
            <div>
              <strong>${training.name}</strong> (${training.type})<br>
              <small>${personName} • ${training.time} min</small>
            </div>
            <button class="training-delete" onclick="deleteTraining(${idx}, ${tIdx})">❌</button>
          </div>
        `;
      });
    } else {
      html += '<p style="color: #999; font-style: italic; margin: 8px 0;">Brak treningów</p>';
    }
    
    html += '</div>';
  });
  
  plannerDiv.innerHTML = html;
}

function deleteTraining(dayIdx, trainIdx) {
  let trainings = JSON.parse(localStorage.getItem('trainings') || '{}');
  if(trainings[dayIdx]) {
    trainings[dayIdx].splice(trainIdx, 1);
    if(trainings[dayIdx].length === 0) delete trainings[dayIdx];
  }
  localStorage.setItem('trainings', JSON.stringify(trainings));
  displayTrainingPlanner();
}

// ---------- BIBLIOTEKA ĆWICZEŃ ----------

const exercises = {
  chest: [
    { name: 'Wyciskanie sztangi na ławce płaskiej', sets: '4x8-12', equipment: 'Sztanga' },
    { name: 'Wyciskanie hantli na ławce skośnej', sets: '3x10-12', equipment: 'Hantle' },
    { name: 'Rozpiętki na ławce', sets: '3x12-15', equipment: 'Hantle' },
    { name: 'Pompki', sets: '3xmax', equipment: 'Ciężar ciała' },
    { name: 'Dipy na poręczach', sets: '3x8-12', equipment: 'Poręcze' }
  ],
  back: [
    { name: 'Podciąganie na drążku', sets: '4x6-10', equipment: 'Drążek' },
    { name: 'Wiosłowanie sztangą w opadzie', sets: '4x8-12', equipment: 'Sztanga' },
    { name: 'Wiosłowanie hantlem', sets: '3x10-12', equipment: 'Hantel' },
    { name: 'Ściąganie drążka wyciągu górnego', sets: '3x12-15', equipment: 'Wyciąg' },
    { name: 'Martwy ciąg', sets: '3x6-8', equipment: 'Sztanga' }
  ],
  legs: [
    { name: 'Przysiad ze sztangą', sets: '4x8-12', equipment: 'Sztanga' },
    { name: 'Wypychanie nóg na maszynie', sets: '3x12-15', equipment: 'Maszyna' },
    { name: 'Martwy ciąg rumuński', sets: '3x10-12', equipment: 'Sztanga' },
    { name: 'Wykroki z hantlami', sets: '3x12 każda noga', equipment: 'Hantle' },
    { name: 'Prostowanie/zginanie nóg', sets: '3x12-15', equipment: 'Maszyna' }
  ],
  arms: [
    { name: 'Uginanie ramion ze sztangą', sets: '3x10-12', equipment: 'Sztanga' },
    { name: 'Uginanie ramion z hantlami', sets: '3x12-15', equipment: 'Hantle' },
    { name: 'Wyciskanie francuskie', sets: '3x10-12', equipment: 'Sztanga/Hantle' },
    { name: 'Prostowanie ramion na wyciągu', sets: '3x12-15', equipment: 'Wyciąg' },
    { name: 'Uginanie ramion młotkiem', sets: '3x12-15', equipment: 'Hantle' }
  ],
  core: [
    { name: 'Plank', sets: '3x60s', equipment: 'Ciężar ciała' },
    { name: 'Spięcia brzucha', sets: '3x15-20', equipment: 'Ciężar ciała' },
    { name: 'Unoszenie nóg w zwisie', sets: '3x10-15', equipment: 'Drążek' },
    { name: 'Russian twist', sets: '3x20', equipment: 'Ciężar ciała/Obciążenie' },
    { name: 'Mountain climbers', sets: '3x30s', equipment: 'Ciężar ciała' }
  ],
  cardio: [
    { name: 'Bieg ciągły', sets: '20-45 min', equipment: 'Bieżnia/Zewnątrz' },
    { name: 'Interwały biegowe', sets: '10x1min intensywnie', equipment: 'Bieżnia' },
    { name: 'Rower stacjonarny', sets: '30-45 min', equipment: 'Rower' },
    { name: 'Burpees', sets: '3x15-20', equipment: 'Ciężar ciała' },
    { name: 'Jumping jacks', sets: '3x30-60s', equipment: 'Ciężar ciała' }
  ]
};

function showExercises(category) {
  const listDiv = document.getElementById('exerciseList');
  const exList = exercises[category];
  
  let html = `<h4>📝 Ćwiczenia - ${category}</h4>`;
  
  exList.forEach(ex => {
    html += `
      <div class="fridge-item">
        <div>
          <strong>${ex.name}</strong><br>
          <small>Seria: ${ex.sets} • Sprzęt: ${ex.equipment}</small>
        </div>
      </div>
    `;
  });
  
  listDiv.innerHTML = html;
}

// ---------- INICJALIZACJA ----------

// Wczytaj przy starcie
loadCustomDishes();
loadSavedCalories();
loadSavedNames();
createDropdowns();

// Ustaw dzisiejszą datę w polu wagi
document.getElementById('weightDate').value = new Date().toISOString().split('T')[0];

// Event listeners dla trackera wody - aktualizuj przy zmianie osoby lub celu

// ===== STATYSTYKI & GARMIN =====

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

// Inicjalizacja przy wczytaniu zakładki
document.addEventListener('DOMContentLoaded', () => {
  updateStatsSummary();
  displayTrainingHistory();
  updateActivityTypeFilter();
});
document.getElementById('waterPerson').addEventListener('change', displayWaterProgress);
document.getElementById('waterGoal').addEventListener('change', displayWaterProgress);
