-- ============================================
-- Blog Database Schema
-- ============================================

-- Utwórz bazę danych
CREATE DATABASE IF NOT EXISTS blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blog_db;

-- ============================================
-- Tabela użytkowników
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(255),
    role ENUM('admin', 'editor', 'author', 'subscriber') DEFAULT 'subscriber',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Tabela kategorii
-- ============================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id INT NULL,
    post_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Tabela tagów
-- ============================================
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    post_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Tabela postów
-- ============================================
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    featured_image VARCHAR(255),
    author_id INT NOT NULL,
    category_id INT,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    views INT DEFAULT 0,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_published_at (published_at),
    FULLTEXT idx_search (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Tabela powiązań postów z tagami
-- ============================================
CREATE TABLE post_tags (
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Tabela komentarzy
-- ============================================
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    parent_id INT NULL,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(100) NOT NULL,
    author_ip VARCHAR(45),
    content TEXT NOT NULL,
    status ENUM('pending', 'approved', 'spam', 'trash') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Tabela wiadomości kontaktowych
-- ============================================
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    ip_address VARCHAR(45),
    status ENUM('unread', 'read', 'replied', 'archived') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Tabela subskrypcji newsletter
-- ============================================
CREATE TABLE newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    status ENUM('active', 'unsubscribed') DEFAULT 'active',
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Tabela ustawień
-- ============================================
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Dane przykładowe
-- ============================================

-- Użytkownik admin (hasło: admin123 - ZMIEŃ TO!)
INSERT INTO users (username, email, password_hash, display_name, bio, role) VALUES
('admin', 'admin@blog.pl', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jan Kowalski', 'Pasjonat technologii i programowania', 'admin');

-- Kategorie
INSERT INTO categories (name, slug, description) VALUES
('Technologia', 'technologia', 'Artykuły o najnowszych technologiach'),
('Programowanie', 'programowanie', 'Wskazówki i tutoriale programistyczne'),
('Lifestyle', 'lifestyle', 'O życiu i work-life balance'),
('Podróże', 'podroze', 'Relacje z podróży');

-- Tagi
INSERT INTO tags (name, slug) VALUES
('HTML', 'html'),
('CSS', 'css'),
('JavaScript', 'javascript'),
('PHP', 'php'),
('MySQL', 'mysql'),
('Tutorial', 'tutorial'),
('Tips', 'tips'),
('Web Design', 'web-design');

-- Przykładowy post
INSERT INTO posts (title, slug, excerpt, content, featured_image, author_id, category_id, status, published_at) VALUES
('Jak stworzyć nowoczesny blog w 2026 roku', 
'jak-stworzyc-nowoczesny-blog-w-2026-roku',
'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
'<h2>Wprowadzenie</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>',
'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=600&fit=crop',
1, 1, 'published', NOW());

-- Powiązanie posta z tagami
INSERT INTO post_tags (post_id, tag_id) VALUES
(1, 1), (1, 2), (1, 6), (1, 8);

-- Przykładowe komentarze
INSERT INTO comments (post_id, author_name, author_email, content, status, created_at) VALUES
(1, 'Anna Nowak', 'anna@example.com', 'Świetny artykuł! Bardzo pomocne wskazówki dla początkujących.', 'approved', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 'Piotr Wiśniewski', 'piotr@example.com', 'Mam pytanie - którą platformę polecasz dla kogoś, kto dopiero zaczyna?', 'approved', DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- Ustawienia bloga
INSERT INTO settings (setting_key, setting_value) VALUES
('site_title', 'Mój Blog'),
('site_description', 'Dzielę się swoimi myślami, doświadczeniami i pomysłami'),
('posts_per_page', '10'),
('comments_enabled', '1'),
('comment_moderation', '1');

-- ============================================
-- Triggery do automatycznej aktualizacji liczników
-- ============================================

DELIMITER $$

-- Trigger: Zwiększ licznik postów w kategorii
CREATE TRIGGER increment_category_count AFTER INSERT ON posts
FOR EACH ROW
BEGIN
    IF NEW.status = 'published' AND NEW.category_id IS NOT NULL THEN
        UPDATE categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
    END IF;
END$$

-- Trigger: Zmniejsz licznik postów w kategorii
CREATE TRIGGER decrement_category_count AFTER DELETE ON posts
FOR EACH ROW
BEGIN
    IF OLD.status = 'published' AND OLD.category_id IS NOT NULL THEN
        UPDATE categories SET post_count = post_count - 1 WHERE id = OLD.category_id;
    END IF;
END$$

-- Trigger: Aktualizuj licznik tagów
CREATE TRIGGER increment_tag_count AFTER INSERT ON post_tags
FOR EACH ROW
BEGIN
    UPDATE tags SET post_count = post_count + 1 WHERE id = NEW.tag_id;
END$$

CREATE TRIGGER decrement_tag_count AFTER DELETE ON post_tags
FOR EACH ROW
BEGIN
    UPDATE tags SET post_count = post_count - 1 WHERE id = OLD.tag_id;
END$$

DELIMITER ;
