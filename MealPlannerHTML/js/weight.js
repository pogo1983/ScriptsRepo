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

function deleteWeightEntry(idx) {
  let weights = JSON.parse(localStorage.getItem('weights') || '[]');
  weights.splice(idx, 1);
  localStorage.setItem('weights', JSON.stringify(weights));
  displayWeightHistory();
}

function deleteWeight(idx) {
  deleteWeightEntry(idx);
}
