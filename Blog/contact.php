<?php require_once 'includes/functions.php'; ?>
<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo t('contact'); ?> - <?php echo SITE_TITLE; ?></title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="header-content">
                <h1 class="logo"><a href="index.php"><?php echo SITE_TITLE; ?></a></h1>
                <nav class="nav">
                    <a href="index.php" class="nav-link"><?php echo t('home'); ?></a>
                    <a href="about.php" class="nav-link"><?php echo t('about'); ?></a>
                    <a href="contact.php" class="nav-link active"><?php echo t('contact'); ?></a>
                    <a href="admin/admin.php" class="nav-link" style="color: #ef4444;">⚙️ <?php echo t('admin'); ?></a>
                    <?php langSwitcher(); ?>
                </nav>
            </div>
        </div>
    </header>

    <!-- Page Header -->
    <section class="page-header">
        <div class="container">
            <h1 class="page-title"><?php echo t('contact'); ?></h1>
            <p class="page-subtitle"><?php echo t('get_in_touch'); ?></p>
        </div>
    </section>

    <!-- Main Content -->
    <main class="main">
        <div class="container">
            <div class="contact-wrapper">
                <div class="contact-info">
                    <h2>Napisz do mnie</h2>
                    <p>Masz pytanie, propozycję współpracy lub po prostu chcesz się przywitać? Wypełnij formularz, a postaram się odpowiedzieć najszybciej jak to możliwe.</p>
                    
                    <div class="contact-methods">
                        <div class="contact-method">
                            <div class="contact-icon">📧</div>
                            <div class="contact-method-content">
                                <h3>Email</h3>
                                <a href="mailto:kontakt@mojblog.pl">kontakt@mojblog.pl</a>
                            </div>
                        </div>
                        
                        <div class="contact-method">
                            <div class="contact-icon">💼</div>
                            <div class="contact-method-content">
                                <h3>LinkedIn</h3>
                                <a href="#">linkedin.com/in/jankowalski</a>
                            </div>
                        </div>
                        
                        <div class="contact-method">
                            <div class="contact-icon">🐙</div>
                            <div class="contact-method-content">
                                <h3>GitHub</h3>
                                <a href="#">github.com/jankowalski</a>
                            </div>
                        </div>
                        
                        <div class="contact-method">
                            <div class="contact-icon">🐦</div>
                            <div class="contact-method-content">
                                <h3>Twitter</h3>
                                <a href="#">@jankowalski</a>
                            </div>
                        </div>
                    </div>

                    <div class="response-time">
                        <p><strong>⏱️ Czas odpowiedzi:</strong> zazwyczaj do 24 godzin</p>
                    </div>
                </div>

                <div class="contact-form-wrapper">
                    <form class="contact-form">
                        <div class="form-group">
                            <label for="name" class="form-label"><?php echo t('your_name'); ?></label>
                            <input type="text" id="name" name="name" class="form-input" placeholder="Jan Kowalski" required>
                        </div>

                        <div class="form-group">
                            <label for="email" class="form-label"><?php echo t('your_email'); ?></label>
                            <input type="email" id="email" name="email" class="form-input" placeholder="jan@example.com" required>
                        </div>

                        <div class="form-group">
                            <label for="subject" class="form-label"><?php echo t('subject'); ?></label>
                            <input type="text" id="subject" name="subject" class="form-input" placeholder="W czym mogę pomóc?" required>
                        </div>

                        <div class="form-group">
                            <label for="message" class="form-label"><?php echo t('your_message'); ?></label>
                            <textarea id="message" name="message" class="form-textarea" rows="6" placeholder="Twoja wiadomość..." required></textarea>
                        </div>

                        <div class="form-group">
                            <label class="form-checkbox">
                                <input type="checkbox" required>
                                <span>Zgadzam się na przetwarzanie moich danych osobowych zgodnie z polityką prywatności</span>
                            </label>
                        </div>

                        <button type="submit" class="btn btn-primary btn-large"><?php echo t('send_message'); ?></button>
                    </form>
                </div>
            </div>

            <!-- FAQ Section -->
            <div class="faq-section">
                <h2 class="section-title">Często zadawane pytania</h2>
                <div class="faq-grid">
                    <div class="faq-item">
                        <h3>💬 Jak szybko odpowiadasz na wiadomości?</h3>
                        <p>Staram się odpowiadać na wszystkie wiadomości w ciągu 24 godzin. W weekendy może to potrwać nieco dłużej.</p>
                    </div>
                    
                    <div class="faq-item">
                        <h3>💼 Czy przyjmujesz zlecenia?</h3>
                        <p>Tak, jestem otwarty na ciekawe projekty. Napisz do mnie z opisem swojego pomysłu, a omówimy szczegóły.</p>
                    </div>
                    
                    <div class="faq-item">
                        <h3>🎓 Czy oferujesz konsultacje?</h3>
                        <p>Tak, prowadzę konsultacje online dla osób uczących się programowania oraz firm szukających doradztwa technologicznego.</p>
                    </div>
                    
                    <div class="faq-item">
                        <h3>📝 Czy mogę zaproponować temat na bloga?</h3>
                        <p>Oczywiście! Chętnie poznam Twoje propozycje tematów. Jeśli będą pasować do profilu bloga, z przyjemnością je zrealizuję.</p>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <p>&copy; 2026 <?php echo SITE_TITLE; ?>. Wszystkie prawa zastrzeżone.</p>
                <div class="social-links">
                    <a href="#" class="social-link">Facebook</a>
                    <a href="#" class="social-link">Twitter</a>
                    <a href="#" class="social-link">Instagram</a>
                </div>
            </div>
        </div>
    </footer>

    <script src="assets/js/blog.js"></script>
</body>
</html>
