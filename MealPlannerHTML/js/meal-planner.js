// ========================================
// MEAL PLANNER - CORE FUNCTIONS
// ========================================

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
    html += "<tr><td class='day-label'><strong>"+dni[i]+"</strong></td>";
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
    
  let plan = "<div class='result-section'><h2>📅 Jadłospis na tydzień</h2>";
  
  // Przycisk rozwiń/zwiń wszystkie dni
  plan += "<div class='accordion-controls'>";
  plan += "<button class='btn-secondary' onclick='toggleAllDays(true)'>📂 Rozwiń wszystkie</button>";
  plan += "<button class='btn-secondary' onclick='toggleAllDays(false)'>📁 Zwiń wszystkie</button>";
  plan += "</div>";
  
  // Karty dla każdego dnia (accordion)
  plan += "<div class='week-plan-cards'>";
  
  let zakupy = {}; // sumowanie składników
  let totalCalories1 = Array(7).fill(0); // kalorie dla osoby 1 na każdy dzień
  let totalCalories2 = Array(7).fill(0); // kalorie dla osoby 2 na każdy dzień
  
  // Przechowuj szczegółowe dane dla każdego dnia
  let dayMealsData = [];
  
  for(let i=0;i<dni.length;i++){
    let dayMeals = [];
    
    // Rozpocznij kartę dnia z accordion
    plan += `<div class='day-plan-card accordion-item'>
      <h3 class='day-plan-title accordion-header' onclick='toggleDay(${i})'>
        <span><span class='accordion-icon'>▼</span> ${dni[i]}</span>
        <span class='day-calories-preview'>... kcal</span>
      </h3>
      <div class='day-plan-meals accordion-content active' id='day-content-${i}'>`;
    
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
      let totalGramsMichalina = 0;
      let totalGramsMarcin = 0;
      
      for (const [skladnik,[gramM,gramMA]] of Object.entries(d.skladniki)){
        let jednostka = skladnik === "Jajka" || skladnik.includes("Baton") ? "szt" : "g";
        if (jednostka === "g") {
          totalGramsMichalina += gramM;
          totalGramsMarcin += gramMA;
        }
      }
      
      let gramsRatio = totalGramsMarcin > 0 ? totalGramsMarcin / totalGramsMichalina : 1.5;
      let baseCaloriesForMichalina = d.kalorie || 0;
      let baseCaloriesForMarcin = Math.round((d.kalorie || 0) * gramsRatio);
      
      let caloriesScaled1 = Math.round(baseCaloriesForMichalina * (currentCaloriesMichalina / BASE_CALORIES_MICHALINA));
      let caloriesScaled2 = Math.round(baseCaloriesForMarcin * (currentCaloriesMarcin / BASE_CALORIES_MARCIN));
      
      totalCalories1[i] += caloriesScaled1;
      totalCalories2[i] += caloriesScaled2;
      
      let skladM = [], skladMA = [];
      
      let mealData = {
        posilek: posilek,
        nazwa: d.nazwa,
        skladniki: {}
      };
      
      for (const [skladnik,[gramM,gramMA]] of Object.entries(d.skladniki)){
        let jednostka = skladnik === "Jajka" || skladnik.includes("Baton") ? "szt" : "g";
        let scaledM = jednostka === "szt" ? gramM : scaleAmount(gramM, false);
        let scaledMA = jednostka === "szt" ? gramMA : scaleAmount(gramMA, true);
        
        skladM.push(skladnik+": "+scaledM+jednostka);
        skladMA.push(skladnik+": "+scaledMA+jednostka);
        
        mealData.skladniki[skladnik] = {
          michalina: scaledM,
          marcin: scaledMA,
          jednostka: jednostka
        };
        
        zakupy[skladnik] = zakupy[skladnik] || {michalina:0, marcin:0, jednostka: jednostka};
        zakupy[skladnik].michalina += scaledM;
        zakupy[skladnik].marcin += scaledMA;
      }
      
      dayMeals.push(mealData);
      
      let calorieDisplay = "";
      if(d.kalorie) {
        calorieDisplay = `<span class='person-michalina'>${caloriesScaled1}</span> / <span class='person-marcin'>${caloriesScaled2}</span> kcal`;
      }
      
      // Karta posiłku
      plan += `
        <div class='meal-plan-card'>
          <div class='meal-plan-header'>
            <span class='meal-plan-icon'>${posilekDisplay}</span>
            <span class='meal-plan-name'>${d.nazwa}</span>
          </div>
          <div class='meal-plan-people'>
            <div class='meal-plan-person person-michalina'>
              <strong>${namePerson1}:</strong> ${skladM.join(", ")}
            </div>
            <div class='meal-plan-person person-marcin'>
              <strong>${namePerson2}:</strong> ${skladMA.join(", ")}
            </div>
          </div>
          <div class='meal-plan-calories'>${calorieDisplay}</div>
        </div>`;
    });
    
    // Zakończ kartę dnia z podsumowaniem kalorii
    plan += `
      <div class='day-plan-summary'>
        <div class='person-michalina'><strong>${namePerson1}:</strong> ${totalCalories1[i]} kcal</div>
        <div class='person-marcin'><strong>${namePerson2}:</strong> ${totalCalories2[i]} kcal</div>
      </div>
      </div></div>`;
    
    dayMealsData.push(dayMeals);
  }
  
  // Zamknij wszystkie karty
  plan += "</div></div>";

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
  
  // Aktualizuj kalorie w nagłówkach dni
  for(let i=0; i<dni.length; i++) {
    const header = document.querySelector(`#day-content-${i}`).previousElementSibling;
    const preview = header.querySelector('.day-calories-preview');
    if(preview) {
      preview.innerHTML = `${totalCalories1[i]} / ${totalCalories2[i]} kcal`;
    }
  }
  
  // Dodaj/zaktualizuj floating action button
  addFloatingButtons();
  
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
  zakHTML += "<button class='btn-export btn-ios' onclick='exportToiOSReminders()'>📱 Eksportuj do iOS Reminders</button>";
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

// ---------- ACCORDION FUNCTIONS ----------

function toggleDay(dayIndex) {
  const content = document.getElementById(`day-content-${dayIndex}`);
  const header = content.previousElementSibling;
  const icon = header.querySelector('.accordion-icon');
  
  if(content.classList.contains('active')) {
    content.classList.remove('active');
    icon.textContent = '▶';
  } else {
    content.classList.add('active');
    icon.textContent = '▼';
  }
}

function toggleAllDays(expand) {
  const contents = document.querySelectorAll('.accordion-content');
  const icons = document.querySelectorAll('.accordion-icon');
  
  contents.forEach(content => {
    if(expand) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
  
  icons.forEach(icon => {
    icon.textContent = expand ? '▼' : '▶';
  });
}

// Make functions globally available for onclick handlers
window.toggleDay = toggleDay;
window.toggleAllDays = toggleAllDays;

// ---------- FLOATING ACTION BUTTONS ----------

function addFloatingButtons() {
  // Usuń stare buttony jeśli istnieją
  const oldFab = document.querySelector('.floating-action-buttons');
  if(oldFab) oldFab.remove();
  
  // Stwórz nowy floating action button container
  const fab = document.createElement('div');
  fab.className = 'floating-action-buttons';
  fab.innerHTML = `
    <button class='fab-button' onclick='scrollToShoppingList()' title='Przejdź do listy zakupów'>
      🛒
    </button>
    <button class='fab-button' onclick='exportToiOSReminders()' title='Eksportuj do iOS Reminders'>
      📱
    </button>
  `;
  
  document.body.appendChild(fab);
  
  // Pokaż FAB tylko gdy plan jest widoczny
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        fab.style.display = 'flex';
      } else {
        fab.style.display = 'none';
      }
    });
  }, { threshold: 0.1 });
  
  const planSection = document.getElementById('plan');
  if(planSection) {
    observer.observe(planSection);
  }
}

function scrollToShoppingList() {
  const zakupySection = document.getElementById('zakupy');
  if(zakupySection) {
    zakupySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Make globally available for onclick handlers
window.scrollToShoppingList = scrollToShoppingList;
