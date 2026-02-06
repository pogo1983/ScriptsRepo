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

function editFridgeItem(idx) {
  // TODO: Implement fridge item editing
  console.log('Editing fridge item:', idx);
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
