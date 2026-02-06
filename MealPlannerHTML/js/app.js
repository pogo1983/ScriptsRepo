// ---------- ZMIENNE GLOBALNE ----------
let currentMealCount = 4;

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

// TODO: W przyszłości dodać Supabase do synchronizacji między urządzeniami
// Supabase = PostgreSQL + admin panel + automatyczny sync
// Setup: supabase.com → create project → add tables → get API key

// ---------- AKTUALIZACJA KALORII ----------

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

// ---------- INICJALIZACJA APLIKACJI ----------

document.addEventListener('DOMContentLoaded', () => {
  // Load data from localStorage
  loadSavedCalories();
  loadSavedNames();
  loadCustomDishes();
  
  updateStatsSummary();
  displayTrainingHistory();
  updateActivityTypeFilter();
});

document.getElementById('waterPerson').addEventListener('change', displayWaterProgress);
document.getElementById('waterGoal').addEventListener('change', displayWaterProgress);
