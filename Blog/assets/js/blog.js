/**
 * JavaScript dla interakcji z API bloga
 */

// ============================================
// Obsługa formularza komentarzy
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    
    // Formularz komentarzy
    const commentForm = document.querySelector('.comment-form form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitComment(this);
        });
    }
    
    // Formularz kontaktowy
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitContact(this);
        });
    }
    
    // Formularz newsletter
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitNewsletter(this);
        });
    }
    
    // Przyciski "Odpowiedz"
    const replyButtons = document.querySelectorAll('.comment-reply');
    replyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // Tutaj można dodać logikę do pokazania formularza odpowiedzi
            alert('Funkcja odpowiedzi będzie dostępna wkrótce');
        });
    });
});

// ============================================
// Wyślij komentarz
// ============================================
function submitComment(form) {
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Wyłącz przycisk
    submitButton.disabled = true;
    submitButton.textContent = 'Wysyłanie...';
    
    fetch('api/comments.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage('success', data.message);
            form.reset();
        } else {
            showMessage('error', data.message);
        }
    })
    .catch(error => {
        showMessage('error', 'Wystąpił błąd. Spróbuj ponownie.');
        console.error('Error:', error);
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    });
}

// ============================================
// Wyślij formularz kontaktowy
// ============================================
function submitContact(form) {
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    submitButton.disabled = true;
    submitButton.textContent = 'Wysyłanie...';
    
    fetch('api/contact.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage('success', data.message);
            form.reset();
        } else {
            showMessage('error', data.message);
        }
    })
    .catch(error => {
        showMessage('error', 'Wystąpił błąd. Spróbuj ponownie.');
        console.error('Error:', error);
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    });
}

// ============================================
// Zapisz newsletter
// ============================================
function submitNewsletter(form) {
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    submitButton.disabled = true;
    submitButton.textContent = 'Wysyłanie...';
    
    fetch('api/newsletter.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage('success', data.message);
            form.reset();
        } else {
            showMessage('error', data.message);
        }
    })
    .catch(error => {
        showMessage('error', 'Wystąpił błąd. Spróbuj ponownie.');
        console.error('Error:', error);
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    });
}

// ============================================
// Pokaż wiadomość (toast notification)
// ============================================
function showMessage(type, message) {
    // Usuń poprzednie wiadomości
    const existingMessages = document.querySelectorAll('.toast-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Utwórz nową wiadomość
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    toast.textContent = message;
    
    // Dodaj style inline (lub możesz dodać do CSS)
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 25px',
        borderRadius: '8px',
        color: 'white',
        backgroundColor: type === 'success' ? '#10b981' : '#ef4444',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: '9999',
        animation: 'slideIn 0.3s ease'
    });
    
    document.body.appendChild(toast);
    
    // Usuń po 5 sekundach
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Dodaj animacje CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
