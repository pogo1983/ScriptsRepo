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

function addWaterEntry(amount) {
  addWater(amount);
}
