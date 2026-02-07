<?php require_once 'includes/functions.php'; ?>
<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo t('about'); ?> - <?php echo SITE_TITLE; ?></title>
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
                    <a href="about.php" class="nav-link active"><?php echo t('about'); ?></a>
                    <a href="contact.php" class="nav-link"><?php echo t('contact'); ?></a>
                    <a href="admin/admin.php" class="nav-link" style="color: #ef4444;">⚙️ <?php echo t('admin'); ?></a>
                    <?php langSwitcher(); ?>
                </nav>
            </div>
        </div>
    </header>

    <!-- Page Header -->
    <section class="page-header">
        <div class="container">
            <h1 class="page-title"><?php echo t('about'); ?></h1>
            <p class="page-subtitle">Poznaj moją historię i pasje</p>
        </div>
    </section>

    <!-- Main Content -->
    <main class="main">
        <div class="container">
            <div class="about-content">
                <div class="about-intro">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop" alt="Jan Kowalski" class="about-image">
                    <div class="about-text">
                        <h2>Cześć, jestem Jan!</h2>
                        <p>Witaj na moim blogu! Jestem pasjonatem technologii, programowania i ciągłego rozwoju. Od ponad 10 lat dzielę się swoją wiedzą i doświadczeniem przez internet.</p>
                        <p>Specjalizuję się w web developmencie, szczególnie w technologiach front-end takich jak JavaScript, React i Vue.js. Uwielbiam tworzyć intuicyjne i piękne interfejsy użytkownika.</p>
                    </div>
                </div>

                <div class="about-section">
                    <h2>Moja historia</h2>
                    <p>Moją przygodę z programowaniem rozpocząłem w 2014 roku, kiedy stworzyłem swoją pierwszą stronę internetową. Od tamtej pory technologia stała się nie tylko moją pracą, ale przede wszystkim pasją.</p>
                    <p>Przez lata miałem okazję pracować z różnymi firmami - od małych startupów po duże korporacje. Każde doświadczenie nauczyło mnie czegoś nowego i pomogło mi rozwinąć zarówno umiejętności techniczne, jak i miękkie.</p>
                </div>

                <div class="about-section">
                    <h2>Co robię?</h2>
                    <div class="skills-grid">
                        <div class="skill-card">
                            <div class="skill-icon">💻</div>
                            <h3>Web Development</h3>
                            <p>Tworzę nowoczesne i responsywne strony internetowe oraz aplikacje webowe.</p>
                        </div>
                        <div class="skill-card">
                            <div class="skill-icon">📝</div>
                            <h3>Blogging</h3>
                            <p>Piszę artykuły o programowaniu, technologii i produktywności.</p>
                        </div>
                        <div class="skill-card">
                            <div class="skill-icon">🎓</div>
                            <h3>Edukacja</h3>
                            <p>Prowadzę kursy i warsztaty dla początkujących programistów.</p>
                        </div>
                        <div class="skill-card">
                            <div class="skill-icon">🚀</div>
                            <h3>Consulting</h3>
                            <p>Pomagam firmom w wyborze odpowiednich rozwiązań technologicznych.</p>
                        </div>
                    </div>
                </div>

                <div class="about-section">
                    <h2>Technologie, które znam</h2>
                    <div class="tech-tags">
                        <span class="tech-tag">JavaScript</span>
                        <span class="tech-tag">React</span>
                        <span class="tech-tag">Vue.js</span>
                        <span class="tech-tag">Node.js</span>
                        <span class="tech-tag">TypeScript</span>
                        <span class="tech-tag">HTML5</span>
                        <span class="tech-tag">CSS3</span>
                        <span class="tech-tag">Sass</span>
                        <span class="tech-tag">Git</span>
                        <span class="tech-tag">webpack</span>
                        <span class="tech-tag">MySQL</span>
                        <span class="tech-tag">MongoDB</span>
                    </div>
                </div>

                <div class="about-section">
                    <h2>Poza komputerem</h2>
                    <p>Gdy nie programuję, lubię spędzać czas aktywnie. Jestem miłośnikiem górskich wędrówek i fotografii krajobrazowej. Uwielbiam również czytać książki o rozwoju osobistym i psychologii.</p>
                    <p>Wierzę w work-life balance i staram się dzielić swoim czasem między pracę, pasje i bliskich.</p>
                </div>

                <div class="about-cta">
                    <h2>Współpracujmy!</h2>
                    <p>Jeśli masz pytanie, pomysł na projekt lub po prostu chcesz pogadać o technologii - zapraszam do kontaktu!</p>
                    <a href="contact.php" class="btn btn-primary">Skontaktuj się ze mną</a>
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
</body>
</html>
