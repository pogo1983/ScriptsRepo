<?php
// System języków

// Pobierz aktualny język z sesji lub ustaw domyślny
if (!isset($_SESSION['lang'])) {
    $_SESSION['lang'] = 'pl'; // Domyślny język
}

// Obsługa zmiany języka
if (isset($_GET['lang']) && in_array($_GET['lang'], ['pl', 'en'])) {
    $_SESSION['lang'] = $_GET['lang'];
    // Przekieruj na tę samą stronę bez parametru lang
    $redirect = strtok($_SERVER['REQUEST_URI'], '?');
    header('Location: ' . $redirect);
    exit;
}

$lang = $_SESSION['lang'];

// Załaduj tłumaczenia
$translations = [
    'pl' => [
        // Nawigacja
        'home' => 'Strona główna',
        'about' => 'O mnie',
        'contact' => 'Kontakt',
        'admin' => 'Admin',
        
        // Blog
        'latest_posts' => 'Najnowsze posty',
        'read_more' => 'Czytaj więcej',
        'written_by' => 'Napisane przez',
        'published_on' => 'Opublikowano',
        'views' => 'wyświetleń',
        'no_posts' => 'Brak postów do wyświetlenia.',
        
        // Sidebar
        'categories' => 'Kategorie',
        'recent_posts' => 'Najnowsze posty',
        'popular_tags' => 'Popularne tagi',
        
        // Post
        'back_to_blog' => 'Powrót do bloga',
        'share_post' => 'Udostępnij',
        'about_author' => 'O autorze',
        'tags' => 'Tagi',
        'comments' => 'Komentarze',
        'leave_comment' => 'Zostaw komentarz',
        'your_name' => 'Twoje imię',
        'your_email' => 'Twój email',
        'your_comment' => 'Twój komentarz',
        'submit' => 'Wyślij',
        'comment_moderation' => 'Twój komentarz oczekuje na moderację.',
        
        // Contact
        'contact_us' => 'Skontaktuj się',
        'get_in_touch' => 'Skontaktuj się z nami',
        'contact_info' => 'Informacje kontaktowe',
        'your_message' => 'Twoja wiadomość',
        'subject' => 'Temat',
        'send_message' => 'Wyślij wiadomość',
        
        // Admin
        'admin_panel' => 'Panel Admina',
        'manage_posts' => 'Zarządzaj postami na blogu',
        'logged_in_as' => 'Zalogowany',
        'back_to_blog' => 'Powrót do bloga',
        'logout' => 'Wyloguj',
        'add_new_post' => 'Dodaj nowy post',
        'post_title' => 'Tytuł posta',
        'post_slug' => 'Slug (URL)',
        'category' => 'Kategoria',
        'featured_image' => 'Zdjęcie wyróżniające (URL)',
        'excerpt' => 'Skrót',
        'content' => 'Treść (HTML)',
        'publish' => 'Opublikuj',
        'all_posts' => 'Wszystkie posty',
        'title' => 'Tytuł',
        'publish_date' => 'Data publikacji',
        'actions' => 'Akcje',
        'view' => 'Zobacz',
        'delete' => 'Usuń',
        'confirm_delete' => 'Czy na pewno chcesz usunąć ten post?',
        
        // Login
        'login_panel' => 'Panel Admina',
        'login_subtitle' => 'Zaloguj się aby kontynuować',
        'username_or_email' => 'Nazwa użytkownika lub email',
        'password' => 'Hasło',
        'login' => 'Zaloguj się',
        'default_credentials' => 'Domyślne dane logowania',
        'change_password' => 'Zmień hasło po pierwszym logowaniu!',
        'invalid_credentials' => 'Nieprawidłowa nazwa użytkownika lub hasło.',
        'fill_all_fields' => 'Wypełnij wszystkie pola.',
        'return_home' => 'Powrót do strony głównej',
    ],
    'en' => [
        // Navigation
        'home' => 'Home',
        'about' => 'About',
        'contact' => 'Contact',
        'admin' => 'Admin',
        
        // Blog
        'latest_posts' => 'Latest Posts',
        'read_more' => 'Read more',
        'written_by' => 'Written by',
        'published_on' => 'Published on',
        'views' => 'views',
        'no_posts' => 'No posts to display.',
        
        // Sidebar
        'categories' => 'Categories',
        'recent_posts' => 'Recent Posts',
        'popular_tags' => 'Popular Tags',
        
        // Post
        'back_to_blog' => 'Back to blog',
        'share_post' => 'Share',
        'about_author' => 'About the author',
        'tags' => 'Tags',
        'comments' => 'Comments',
        'leave_comment' => 'Leave a comment',
        'your_name' => 'Your name',
        'your_email' => 'Your email',
        'your_comment' => 'Your comment',
        'submit' => 'Submit',
        'comment_moderation' => 'Your comment is awaiting moderation.',
        
        // Contact
        'contact_us' => 'Contact Us',
        'get_in_touch' => 'Get in touch with us',
        'contact_info' => 'Contact Information',
        'your_message' => 'Your message',
        'subject' => 'Subject',
        'send_message' => 'Send Message',
        
        // Admin
        'admin_panel' => 'Admin Panel',
        'manage_posts' => 'Manage blog posts',
        'logged_in_as' => 'Logged in as',
        'back_to_blog' => 'Back to blog',
        'logout' => 'Logout',
        'add_new_post' => 'Add New Post',
        'post_title' => 'Post Title',
        'post_slug' => 'Slug (URL)',
        'category' => 'Category',
        'featured_image' => 'Featured Image (URL)',
        'excerpt' => 'Excerpt',
        'content' => 'Content (HTML)',
        'publish' => 'Publish',
        'all_posts' => 'All Posts',
        'title' => 'Title',
        'publish_date' => 'Publish Date',
        'actions' => 'Actions',
        'view' => 'View',
        'delete' => 'Delete',
        'confirm_delete' => 'Are you sure you want to delete this post?',
        
        // Login
        'login_panel' => 'Admin Panel',
        'login_subtitle' => 'Log in to continue',
        'username_or_email' => 'Username or email',
        'password' => 'Password',
        'login' => 'Log in',
        'default_credentials' => 'Default credentials',
        'change_password' => 'Change password after first login!',
        'invalid_credentials' => 'Invalid username or password.',
        'fill_all_fields' => 'Please fill in all fields.',
        'return_home' => 'Return to homepage',
    ]
];

// Funkcja pomocnicza do pobierania tłumaczeń
function t($key) {
    global $translations, $lang;
    return $translations[$lang][$key] ?? $key;
}

// Funkcja do przełączania języka
function langSwitcher() {
    global $lang;
    $otherLang = $lang === 'pl' ? 'en' : 'pl';
    $otherLangName = $lang === 'pl' ? 'EN' : 'PL';
    $flag = $lang === 'pl' ? '🇬🇧' : '🇵🇱';
    
    echo '<a href="?lang=' . $otherLang . '" class="lang-switcher">';
    echo $flag . ' ' . $otherLangName;
    echo '</a>';
}
?>
