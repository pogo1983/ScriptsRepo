<?php
require_once 'includes/functions.php';

// Paginacja
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$page = max(1, $page); // Minimum strona 1
$perPage = POSTS_PER_PAGE;
$offset = ($page - 1) * $perPage;

// Pobierz posty z bazy danych
$category_id = isset($_GET['category']) ? (int)$_GET['category'] : null;
$posts = getPosts($perPage, $offset, $category_id);

// Policz wszystkie posty dla paginacji
global $pdo;
$countSql = "SELECT COUNT(*) FROM posts WHERE status = 'published'";
if ($category_id) {
    $countSql .= " AND category_id = :category_id";
}
$countStmt = $pdo->prepare($countSql);
if ($category_id) {
    $countStmt->bindValue(':category_id', $category_id, PDO::PARAM_INT);
}
$countStmt->execute();
$totalPosts = $countStmt->fetchColumn();
$totalPages = ceil($totalPosts / $perPage);

$categories = getCategories();
$recentPosts = getRecentPosts(3);
$popularTags = getPopularTags(6);
?>
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo SITE_TITLE; ?></title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="header-content">
                <h1 class="logo"><a href="index.php"><?php echo SITE_TITLE; ?></a></h1>
                <nav class="nav">
                    <a href="index.php" class="nav-link active"><?php echo t('home'); ?></a>
                    <a href="about.html" class="nav-link"><?php echo t('about'); ?></a>
                    <a href="contact.html" class="nav-link"><?php echo t('contact'); ?></a>
                    <a href="admin/admin.php" class="nav-link" style="color: #ef4444;">⚙️ <?php echo t('admin'); ?></a>
                    <?php langSwitcher(); ?>
                </nav>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <h2 class="hero-title">Witaj na moim blogu</h2>
            <p class="hero-subtitle"><?php echo SITE_DESCRIPTION; ?></p>
        </div>
    </section>

    <!-- Main Content -->
    <main class="main">
        <div class="container">
            <div class="content-wrapper">
                <!-- Blog Posts -->
                <div class="posts">
                    <?php if (empty($posts)): ?>
                        <p><?php echo t('no_posts'); ?></p>
                    <?php else: ?>
                        <?php foreach ($posts as $post): ?>
                            <!-- Post -->
                            <article class="post">
                                <?php if ($post['featured_image']): ?>
                                    <div class="post-image">
                                        <img src="<?php echo e($post['featured_image']); ?>" alt="<?php echo e($post['title']); ?>">
                                    </div>
                                <?php endif; ?>
                                <div class="post-content">
                                    <div class="post-meta">
                                        <span class="post-date"><?php echo formatDate($post['published_at']); ?></span>
                                        <?php if ($post['category_name']): ?>
                                            <span class="post-category"><?php echo e($post['category_name']); ?></span>
                                        <?php endif; ?>
                                    </div>
                                    <h2 class="post-title">
                                        <a href="post.php?slug=<?php echo e($post['slug']); ?>"><?php echo e($post['title']); ?></a>
                                    </h2>
                                    <p class="post-excerpt">
                                        <?php echo e($post['excerpt']); ?>
                                    </p>
                                    <a href="post.php?slug=<?php echo e($post['slug']); ?>" class="btn"><?php echo t('read_more'); ?> →</a>
                                </div>
                            </article>
                        <?php endforeach; ?>
                    <?php endif; ?>

                    <!-- Pagination -->
                    <?php if ($totalPages > 1): ?>
                    <div class="pagination">
                        <?php if ($page > 1): ?>
                            <a href="?page=<?php echo $page - 1; ?><?php echo $category_id ? '&category=' . $category_id : ''; ?>" class="pagination-link">« <?php echo $lang === 'pl' ? 'Poprzednia' : 'Previous'; ?></a>
                        <?php endif; ?>
                        
                        <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                            <a href="?page=<?php echo $i; ?><?php echo $category_id ? '&category=' . $category_id : ''; ?>" 
                               class="pagination-link <?php echo $i === $page ? 'active' : ''; ?>">
                                <?php echo $i; ?>
                            </a>
                        <?php endfor; ?>
                        
                        <?php if ($page < $totalPages): ?>
                            <a href="?page=<?php echo $page + 1; ?><?php echo $category_id ? '&category=' . $category_id : ''; ?>" class="pagination-link"><?php echo $lang === 'pl' ? 'Następna' : 'Next'; ?> »</a>
                        <?php endif; ?>
                    </div>
                    <?php endif; ?>
                </div>

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
                        <h3 class="widget-title"><?php echo t('categories'); ?></h3>
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
                        <h3 class="widget-title"><?php echo t('recent_posts'); ?></h3>
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

                    <!-- Tags Widget -->
                    <div class="widget">
                        <h3 class="widget-title"><?php echo t('popular_tags'); ?></h3>
                        <div class="widget-content">
                            <div class="tags">
                                <?php foreach ($popularTags as $tag): ?>
                                    <a href="#" class="tag"><?php echo e($tag['name']); ?></a>
                                <?php endforeach; ?>
                            </div>
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
</body>
</html>
