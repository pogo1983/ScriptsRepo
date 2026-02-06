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

function addPrice() {
  savePrice();
}
