// ========================================
// CHYBIŁ TRAFIŁ - Losowanie posiłków
// ========================================

/**
 * Losuje pojedynczy posiłek z wybranej kategorii
 */
function losujPosilek(kategoria) {
  if (!dania[kategoria]) {
    alert('Nieznana kategoria posiłku!');
    return;
  }
  
  const dostepneDania = dania[kategoria];
  const losowyIndex = Math.floor(Math.random() * dostepneDania.length);
  const wylosowaneDanie = dostepneDania[losowyIndex];
  
  wyswietlWylosowaneDanie(kategoria, wylosowaneDanie);
}

/**
 * Wyświetla wylosowane danie w odpowiedniej karcie
 */
function wyswietlWylosowaneDanie(kategoria, danie) {
  const resultDiv = document.getElementById(`random-${kategoria}`);
  
  // Oblicz stosunek gramatur (tak jak w meal-planner.js)
  let totalGramsMichalina = 0;
  let totalGramsMarcin = 0;
  
  for (const [skladnik, gramatury] of Object.entries(danie.skladniki)) {
    if (Array.isArray(gramatury)) {
      // Sprawdź czy to jednostka "szt" czy "g"
      const jednostka = skladnik === "Jajka" || skladnik.includes("Baton") ? "szt" : "g";
      if (jednostka === "g") {
        totalGramsMichalina += gramatury[0];
        totalGramsMarcin += gramatury[1];
      }
    }
  }
  
  let gramsRatio = totalGramsMarcin > 0 ? totalGramsMarcin / totalGramsMichalina : 1.5;
  let baseCaloriesForMichalina = danie.kalorie || 0;
  let baseCaloriesForMarcin = Math.round((danie.kalorie || 0) * gramsRatio);
  
  // Przelicz kalorie dla obu osób (bazując na wybranej opcji kcal)
  const scaledCalories1 = Math.round(baseCaloriesForMichalina * (currentCaloriesMichalina / BASE_CALORIES_MICHALINA));
  const scaledCalories2 = Math.round(baseCaloriesForMarcin * (currentCaloriesMarcin / BASE_CALORIES_MARCIN));
  
  // Animacja znikania
  resultDiv.style.opacity = '0';
  
  setTimeout(() => {
    let skladnikiHTML = '<ul class="random-ingredients">';
    for (const [nazwa, gramatury] of Object.entries(danie.skladniki)) {
      const gramatura = Array.isArray(gramatury) ? gramatury[1] : gramatury;
      skladnikiHTML += `<li>• ${nazwa}: ${gramatura}g</li>`;
    }
    skladnikiHTML += '</ul>';
    
    resultDiv.innerHTML = `
      <div class="random-dish-info">
        <h4>${danie.nazwa}</h4>
        <div class="random-calories">
          🔥 <span class="person-michalina">${scaledCalories1} kcal</span> / <span class="person-marcin">${scaledCalories2} kcal</span>
        </div>
        <details class="random-details">
          <summary>Składniki</summary>
          ${skladnikiHTML}
        </details>
        <button class="btn-reroll" onclick="losujPosilek('${kategoria}')">🔄 Losuj ponownie</button>
      </div>
    `;
    
    // Animacja pojawiania się
    resultDiv.style.opacity = '1';
  }, 200);
}

/**
 * Losuje wszystkie 4 posiłki na dziś
 */
function losujWszystkie() {
  const kategorie = ['śniadanie', 'obiad', 'podwieczorek', 'kolacja'];
  
  // Dodaj małe opóźnienie między losowaniami dla efektu
  kategorie.forEach((kategoria, index) => {
    setTimeout(() => {
      losujPosilek(kategoria);
    }, index * 300);
  });
}
