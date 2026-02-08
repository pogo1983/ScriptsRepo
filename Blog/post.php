<?php
require_once 'includes/functions.php';

// Pobierz slug z URL
$slug = $_GET['slug'] ?? '';

if (empty($slug)) {
    header('Location: index.php');
    exit;
}

// Pobierz post
$post = getPost($slug);

if (!$post) {
    header('HTTP/1.0 404 Not Found');
    echo "<h1>404 - Post nie znaleziony</h1>";
    exit;
}

// Pobierz tagi posta
$tags = getPostTags($post['id']);

// Pobierz komentarze
$comments = getComments($post['id']);

// Pobierz dane do sidebara
$categories = getCategories();
$recentPosts = getRecentPosts(3);
?>
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo e(getLocalizedField($post, 'title')); ?> - <?php echo SITE_TITLE; ?></title>
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
                    <a href="contact.php" class="nav-link"><?php echo t('contact'); ?></a>
                    <a href="admin/admin.php" class="nav-link" style="color: #ef4444;">⚙️ <?php echo t('admin'); ?></a>
                    <?php langSwitcher(); ?>
                </nav>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main">
        <div class="container">
            <div class="content-wrapper">
                <!-- Single Post -->
                <article class="single-post">
                    <div class="post-header">
                        <div class="post-meta">
                            <span class="post-date"><?php echo formatDate($post['published_at']); ?></span>
                            <?php if ($post['category_name']): ?>
                                <span class="post-category"><?php echo e($post['category_name']); ?></span>
                            <?php endif; ?>
                        </div>
                        <h1 class="single-post-title"><?php echo e(getLocalizedField($post, 'title')); ?></h1>
                    </div>

                    <?php if ($post['featured_image']): ?>
                        <div class="post-featured-image">
                            <img src="<?php echo e($post['featured_image']); ?>" alt="<?php echo e(getLocalizedField($post, 'title')); ?>">
                        </div>
                    <?php endif; ?>

                    <div class="post-body">
                        <?php echo getLocalizedField($post, 'content'); // Content already sanitized in DB ?>
                    </div>

                    <!-- Post Footer -->
                    <div class="post-footer">
                        <?php if (!empty($tags)): ?>
                            <div class="post-tags">
                                <span class="tags-label">Tagi:</span>
                                <?php foreach ($tags as $tag): ?>
                                    <a href="#" class="tag"><?php echo e($tag['name']); ?></a>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                        <div class="post-share">
                            <span class="share-label">Udostępnij:</span>
                            <a href="#" class="share-link">Facebook</a>
                            <a href="#" class="share-link">Twitter</a>
                            <a href="#" class="share-link">LinkedIn</a>
                        </div>
                    </div>

                    <!-- Author Bio -->
                    <?php if ($post['author_bio']): ?>
                        <div class="author-bio">
                            <img src="<?php echo $post['author_avatar'] ?: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'; ?>" alt="<?php echo e($post['author_name']); ?>" class="author-bio-image">
                            <div class="author-bio-content">
                                <h3 class="author-bio-name"><?php echo e($post['author_name']); ?></h3>
                                <p class="author-bio-text"><?php echo e($post['author_bio']); ?></p>
                            </div>
                        </div>
                    <?php endif; ?>

                    <!-- Comments Section -->
                    <div class="comments-section">
                        <h2 class="comments-title">Komentarze (<?php echo count($comments); ?>)</h2>
                        
                        <?php if (!empty($comments)): ?>
                            <?php foreach ($comments as $comment): ?>
                                <div class="comment">
                                    <img src="https://ui-avatars.com/api/?name=<?php echo urlencode($comment['author_name']); ?>&size=80" alt="<?php echo e($comment['author_name']); ?>" class="comment-avatar">
                                    <div class="comment-content">
                                        <div class="comment-header">
                                            <span class="comment-author"><?php echo e($comment['author_name']); ?></span>
                                            <span class="comment-date"><?php echo formatDate($comment['created_at']); ?></span>
                                        </div>
                                        <p class="comment-text"><?php echo e($comment['content']); ?></p>
                                        <a href="#" class="comment-reply">Odpowiedz</a>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <p>Brak komentarzy. Bądź pierwszy!</p>
                        <?php endif; ?>

                        <!-- Comment Form -->
                        <div class="comment-form">
                            <h3 class="comment-form-title">Dodaj komentarz</h3>
                            <form>
                                <input type="hidden" name="post_id" value="<?php echo $post['id']; ?>">
                                <div class="form-group">
                                    <input type="text" name="author_name" class="form-input" placeholder="Twoje imię" required>
                                </div>
                                <div class="form-group">
                                    <input type="email" name="author_email" class="form-input" placeholder="Email (nie będzie publikowany)" required>
                                </div>
                                <div class="form-group">
                                    <textarea name="content" class="form-textarea" rows="5" placeholder="Twój komentarz..." required></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary">Opublikuj komentarz</button>
                            </form>
                        </div>
                    </div>
                </article>

                <!-- Sidebar -->
                <aside class="sidebar">
                    <!-- About Widget -->
                    <div class="widget">
                        <h3 class="widget-title">O mnie</h3>
                        <div class="widget-content">
                            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop" alt="Author" class="author-image">
                            <p>Cześć! Jestem pasjonatem technologii i programowania. Dzielę się swoją wiedzą i doświadczeniem.</p>
                        </div>
                    </div>

                    <!-- Categories Widget -->
                    <div class="widget">
                        <h3 class="widget-title">Kategorie</h3>
                        <div class="widget-content">
                            <ul class="categories-list">
                                <?php foreach ($categories as $category): ?>
                                    <li>
                                        <a href="index.php?category=<?php echo e($category['id']); ?>">
                                            <?php echo e($category['name']); ?> 
                                            <span>(<?php echo $category['post_count']; ?>)</span>
                                        </a>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    </div>

                    <!-- Recent Posts Widget -->
                    <div class="widget">
                        <h3 class="widget-title">Ostatnie wpisy</h3>
                        <div class="widget-content">
                            <ul class="recent-posts">
                                <?php foreach ($recentPosts as $recentPost): ?>
                                    <li>
                                        <a href="post.php?slug=<?php echo e($recentPost['slug']); ?>">
                                            <?php echo e($recentPost['title']); ?>
                                        </a>
                                        <span class="recent-date"><?php echo formatDate($recentPost['published_at']); ?></span>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    </div>
                </aside>
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
