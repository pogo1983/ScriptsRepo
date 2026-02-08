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
        <div class="random-calories">🔥 ${danie.kalorie} kcal</div>
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
