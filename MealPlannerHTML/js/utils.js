// ---------- FUNKCJE POMOCNICZE ----------

// Funkcja skalowania gramatur
function scaleAmount(baseAmount, isForMarcin) {
  if(isForMarcin) {
    return Math.round(baseAmount * (currentCaloriesMarcin / BASE_CALORIES_MARCIN));
  } else {
    return Math.round(baseAmount * (currentCaloriesMichalina / BASE_CALORIES_MICHALINA));
  }
}

// Formatowanie liczb
function formatNumber(num) {
  return Math.round(num);
}

// Formatowanie daty
function formatDate(date) {
  return new Date(date).toLocaleDateString('pl-PL');
}

// Formatowanie czasu
function formatTime(date) {
  return new Date(date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}
