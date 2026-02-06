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

function displayTrainingHistory() {
  // Placeholder for training history display
  console.log('Training history display not yet implemented');
}

function addExercise() {
  // Placeholder for adding exercise
  console.log('Add exercise not yet implemented');
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
