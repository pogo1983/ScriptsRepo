// ---------- EKSPORT I WYDRUK ----------

function exportToExcel() {
  if(!window.currentShoppingList) {
    alert('❌ Najpierw wygeneruj listę zakupów!');
    return;
  }
  
  const {zakupy, sortedProducts, selectedDays} = window.currentShoppingList;
  
  // Informacja o wybranych dniach
  const dayText = selectedDays && selectedDays.length < 7 ? 
    `Dni: ${selectedDays.map(i => dni[i]).join(", ")}` : 
    "Dni: Cały tydzień";
  
  // Tworzenie CSV
  let csv = "\uFEFFProdukt;" + namePerson1 + ";" + namePerson2 + ";RAZEM\n"; // \uFEFF to BOM dla UTF-8
  
  for(const prod of sortedProducts){
    const data = zakupy[prod];
    const suma = data.michalina + data.marcin;
    csv += `${prod};${data.michalina} ${data.jednostka};${data.marcin} ${data.jednostka};${suma} ${data.jednostka}\n`;
  }
  
  // Dodaj podsumowanie
  csv += `\n\nWygenerowano: ${new Date().toLocaleDateString('pl-PL')} ${new Date().toLocaleTimeString('pl-PL')}\n`;
  csv += `${dayText}\n`;
  csv += `Cel kaloryczny - ${namePerson1}: ${currentCaloriesMichalina} kcal, ${namePerson2}: ${currentCaloriesMarcin} kcal\n`;
  
  // Tworzenie pliku do pobrania
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const fileName = `lista_zakupow_${new Date().toISOString().split('T')[0]}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  alert('✅ Lista zakupów została wyeksportowana do pliku CSV!\n\nMożesz otworzyć go w Excel lub Google Sheets.');
}

function printShoppingList() {
  if(!window.currentShoppingList) {
    alert('❌ Najpierw wygeneruj listę zakupów!');
    return;
  }
  
  // Otwórz okno wydruku
  window.print();
}

// ---------- EKSPORT DO iOS REMINDERS ----------

function exportToiOSReminders() {
  if(!window.currentShoppingList) {
    alert('❌ Najpierw wygeneruj listę zakupów!');
    return;
  }
  
  const {zakupy, sortedProducts, selectedDays} = window.currentShoppingList;
  
  // Stwórz tytuł listy
  const dayText = selectedDays.length === 7 ? "cały tydzień" : 
                  selectedDays.map(i => dni[i]).join(", ");
  const listTitle = `🛒 Zakupy: ${dayText}`;
  
  // Formatuj listę zakupów
  let shoppingText = listTitle + "\n\n";
  
  sortedProducts.forEach(prod => {
    const data = zakupy[prod];
    const suma = data.michalina + data.marcin;
    // Format: - Produkt: ilość jednostka
    shoppingText += `☐ ${prod}: ${suma} ${data.jednostka}\n`;
  });
  
  shoppingText += `\n📅 Wygenerowano: ${new Date().toLocaleDateString('pl-PL')}`;
  
  // Sprawdź czy urządzenie wspiera Web Share API (iOS/macOS)
  if (navigator.share) {
    // iOS Share Sheet - użytkownik może wybrać Reminders
    navigator.share({
      title: listTitle,
      text: shoppingText
    })
    .then(() => {
      // Sukces - nic nie rób
    })
    .catch((error) => {
      // Jeśli anulowano lub błąd, pokaż fallback
      if (error.name !== 'AbortError') {
        copyToClipboardFallback(shoppingText);
      }
    });
  } else {
    // Fallback - skopiuj do schowka
    copyToClipboardFallback(shoppingText);
  }
}

function copyToClipboardFallback(text) {
  // Spróbuj użyć Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('✅ Lista zakupów skopiowana do schowka!\n\nOtwórz aplikację Przypomnienia i wklej listę (Cmd+V / Ctrl+V)');
      })
      .catch(() => {
        // Jeśli nie działa, użyj starej metody
        fallbackCopyToClipboard(text);
      });
  } else {
    fallbackCopyToClipboard(text);
  }
}

function fallbackCopyToClipboard(text) {
  // Stara metoda - stwórz textarea i skopiuj
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    alert('✅ Lista zakupów skopiowana do schowka!\n\nOtwórz aplikację Przypomnienia i wklej listę (Cmd+V / Ctrl+V)');
  } catch (err) {
    // Jeśli to też nie działa, pokaż modal z tekstem
    showTextModal(text);
  }
  
  document.body.removeChild(textArea);
}

function showTextModal(text) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    padding: 24px;
    border-radius: 16px;
    max-width: 600px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
  `;
  
  content.innerHTML = `
    <h3 style="margin-top: 0;">📋 Lista zakupów</h3>
    <p style="color: #666;">Skopiuj poniższą listę i wklej do aplikacji Przypomnienia:</p>
    <textarea readonly style="width: 100%; min-height: 300px; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px;">${text}</textarea>
    <div style="margin-top: 16px; text-align: right;">
      <button onclick="this.parentElement.parentElement.parentElement.remove()" style="padding: 10px 20px; background: #007AFF; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 15px;">Zamknij</button>
    </div>
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  // Zamknij po kliknięciu tła
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// ---------- EKSPORT DO KALENDARZA (.ICS) ----------

function exportToCalendar() {
  if (!fullPlanData || !fullPlanData.dayMealsData) {
    alert('❌ Najpierw wygeneruj plan tygodniowy!');
    return;
  }

  // Funkcja do formatowania daty w formacie iCalendar (YYYYMMDDTHHMMSS)
  function formatICalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  }

  // Rozpocznij od poniedziałku obecnego lub następnego tygodnia
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + daysUntilMonday);
  startDate.setHours(0, 0, 0, 0);

  // Godziny posiłków
  const mealTimes = {
    'śniadanie': { hour: 7, minute: 0, duration: 30 },
    'obiad': { hour: 13, minute: 0, duration: 60 },
    'podwieczorek': { hour: 16, minute: 0, duration: 20 },
    'kolacja': { hour: 19, minute: 0, duration: 45 }
  };

  const mealIcons = {
    'śniadanie': '🌅',
    'obiad': '🍴',
    'podwieczorek': '🍎',
    'kolacja': '🌙'
  };

  // Rozpocznij tworzenie pliku .ics
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Meal Planner//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Plan posiłków',
    'X-WR-TIMEZONE:Europe/Warsaw'
  ].join('\r\n') + '\r\n';

  // Dodaj wydarzenia dla każdego dnia i posiłku
  fullPlanData.dayMealsData.forEach((dayData, dayIndex) => {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayIndex);

    dayData.meals.forEach(meal => {
      const mealType = meal.type;
      const time = mealTimes[mealType];
      
      if (!time) return;

      // Data rozpoczęcia
      const eventStart = new Date(currentDate);
      eventStart.setHours(time.hour, time.minute, 0, 0);

      // Data zakończenia
      const eventEnd = new Date(eventStart);
      eventEnd.setMinutes(eventStart.getMinutes() + time.duration);

      // Nazwa dania
      const mealName = meal.dish.nazwa;
      const icon = mealIcons[mealType] || '🍽️';

      // Opis z listą składników
      let description = `Składniki:\\n`;
      for (const [ingredient, grams] of Object.entries(meal.dish.skladniki)) {
        if (Array.isArray(grams)) {
          description += `• ${ingredient}: ${grams[0]}g / ${grams[1]}g (${namePerson1}/${namePerson2})\\n`;
        } else {
          description += `• ${ingredient}: ${grams}\\n`;
        }
      }
      description += `\\nKalorie: ${meal.calories1} kcal / ${meal.calories2} kcal`;

      // Utwórz event
      const uid = `meal-${dayIndex}-${mealType}-${Date.now()}@mealplanner`;
      const summary = `${icon} ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}: ${mealName}`;

      icsContent += [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${formatICalDate(new Date())}`,
        `DTSTART:${formatICalDate(eventStart)}`,
        `DTEND:${formatICalDate(eventEnd)}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `STATUS:CONFIRMED`,
        `SEQUENCE:0`,
        'END:VEVENT'
      ].join('\r\n') + '\r\n';
    });
  });

  icsContent += 'END:VCALENDAR';

  // Pobierz plik
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const fileName = `meal_plan_${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}.ics`;
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  alert('✅ Plan posiłków został wyeksportowany do kalendarza!\n\nMożesz zaimportować plik .ics do Apple Calendar, Google Calendar lub Outlook.');
}

// Make function globally available
window.exportToCalendar = exportToCalendar;
