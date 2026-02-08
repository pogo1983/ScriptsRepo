<?php
require_once '../includes/functions.php';

// Sprawdź autentykację
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

// Obsługa formularza dodawania posta
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add') {
    $title = $_POST['title'] ?? '';
    $title_en = $_POST['title_en'] ?? '';
    $slug = $_POST['slug'] ?? '';
    $excerpt = $_POST['excerpt'] ?? '';
    $excerpt_en = $_POST['excerpt_en'] ?? '';
    $content = $_POST['content'] ?? '';
    $content_en = $_POST['content_en'] ?? '';
    $category_id = $_POST['category_id'] ?? null;
    $featured_image = $_POST['featured_image'] ?? '';
    
    // Obsługa upload'u obrazka
    if (isset($_FILES['featured_image_file']) && $_FILES['featured_image_file']['error'] === UPLOAD_ERR_OK) {
        $uploadResult = uploadImage($_FILES['featured_image_file']);
        if ($uploadResult['success']) {
            $featured_image = $uploadResult['path'];
        } else {
            $error = $uploadResult['message'];
        }
    }
    
    if (!empty($title) && !empty($slug) && !empty($content) && !isset($error)) {
        global $pdo;
        $stmt = $pdo->prepare("
            INSERT INTO posts (title, title_en, slug, excerpt, excerpt_en, content, content_en, featured_image, author_id, category_id, status, published_at)
            VALUES (:title, :title_en, :slug, :excerpt, :excerpt_en, :content, :content_en, :featured_image, 1, :category_id, 'published', NOW())
        ");
        
        $result = $stmt->execute([
            'title' => $title,
            'title_en' => $title_en,
            'slug' => $slug,
            'excerpt' => $excerpt,
            'excerpt_en' => $excerpt_en,
            'content' => $content,
            'content_en' => $content_en,
            'featured_image' => $featured_image,
            'category_id' => $category_id
        ]);
        
        if ($result) {
            $success = "Post dodany pomyślnie!";
        } else {
            $error = "Błąd podczas dodawania posta.";
        }
    } else {
        $error = "Wypełnij wymagane pola: tytuł, slug, treść.";
    }
}

// Obsługa usuwania posta
if (isset($_GET['delete'])) {
    global $pdo;
    $stmt = $pdo->prepare("DELETE FROM posts WHERE id = :id");
    $stmt->execute(['id' => $_GET['delete']]);
    header('Location: admin.php');
    exit;
}

// Pobierz wszystkie posty
$allPosts = getPosts(100);
$categories = getCategories();
?>
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Admina - <?php echo SITE_TITLE; ?></title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <style>
        .admin-container {
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 20px;
        }
        .admin-header {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .admin-section {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: var(--shadow-md);
            margin-bottom: 30px;
        }
        .admin-table {
            width: 100%;
            border-collapse: collapse;
        }
        .admin-table th,
        .admin-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        .admin-table th {
            background-color: var(--bg-light);
            font-weight: 600;
        }
        .admin-table tr:hover {
            background-color: var(--bg-light);
        }
        .btn-small {
            padding: 6px 12px;
            font-size: 14px;
            margin-right: 5px;
        }
        .btn-danger {
            background-color: #ef4444;
        }
        .btn-danger:hover {
            background-color: #dc2626;
        }
        .alert {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .alert-success {
            background-color: #d1fae5;
            color: #065f46;
            border: 1px solid #34d399;
        }
        .alert-error {
            background-color: #fee2e2;
            color: #991b1b;
            border: 1px solid #f87171;
        }
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        @media (max-width: 768px) {
            .form-row {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <div class="admin-header">
            <div>
                <h1><?php echo t('admin_panel'); ?></h1>
                <p><?php echo t('manage_posts'); ?> | <?php echo t('logged_in_as'); ?>: <strong><?php echo e($_SESSION['username']); ?></strong></p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <?php langSwitcher(); ?>
                <a href="../index.php" class="btn" style="background: white; color: var(--primary-color);">← <?php echo t('back_to_blog'); ?></a>
                <a href="logout.php" class="btn" style="background: #ef4444; color: white;"><?php echo t('logout'); ?></a>
            </div>
        </div>

        <?php if (isset($success)): ?>
            <div class="alert alert-success"><?php echo $success; ?></div>
        <?php endif; ?>

        <?php if (isset($error)): ?>
            <div class="alert alert-error"><?php echo $error; ?></div>
        <?php endif; ?>

        <!-- Formularz dodawania posta -->
        <div class="admin-section">
            <h2>Dodaj nowy post</h2>
            <form method="POST" enctype="multipart/form-data">
                <input type="hidden" name="action" value="add">
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="title" class="form-label">🇵🇱 Tytuł (PL) *</label>
                        <input type="text" id="title" name="title" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="title_en" class="form-label">🇬🇧 Title (EN)</label>
                        <input type="text" id="title_en" name="title_en" class="form-input" placeholder="English title (optional)">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="slug" class="form-label">Slug * (np. moj-post)</label>
                        <input type="text" id="slug" name="slug" class="form-input" required>
                    </div>
                    <div></div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="category_id" class="form-label">Kategoria</label>
                        <select id="category_id" name="category_id" class="form-input">
                            <option value="">-- Wybierz kategorię --</option>
                            <?php foreach ($categories as $cat): ?>
                                <option value="<?php echo $cat['id']; ?>"><?php echo e($cat['name']); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div></div>
                </div>

                <!-- Obrazek wyróżniający -->
                <div class="form-group" style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="margin-top: 0; font-size: 18px; color: var(--text-color);">📸 Obrazek wyróżniający</h3>
                    <p style="color: var(--text-light); font-size: 14px; margin-bottom: 15px;">Wybierz obrazek z dysku lub podaj link URL</p>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="featured_image_file" class="form-label">🖼️ Upload z dysku</label>
                            <input type="file" id="featured_image_file" name="featured_image_file" 
                                   class="form-input" accept="image/jpeg,image/png,image/gif,image/webp">
                            <small style="color: var(--text-light);">Max 5 MB. Format: JPG, PNG, GIF, WebP</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="featured_image" class="form-label">🔗 Lub URL obrazka</label>
                            <input type="url" id="featured_image" name="featured_image" class="form-input" 
                                   placeholder="https://images.unsplash.com/...">
                            <small style="color: var(--text-light);">Unsplash, Pexels, własny link</small>
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="excerpt" class="form-label">🇵🇱 Krótki opis (PL)</label>
                        <textarea id="excerpt" name="excerpt" class="form-textarea" rows="3" 
                                  placeholder="Krótki opis po polsku..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="excerpt_en" class="form-label">🇬🇧 Short description (EN)</label>
                        <textarea id="excerpt_en" name="excerpt_en" class="form-textarea" rows="3" 
                                  placeholder="Short description in English (optional)..."></textarea>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="content" class="form-label">🇵🇱 Treść posta (PL) * (HTML)</label>
                        <textarea id="content" name="content" class="form-textarea" rows="10" 
                                  placeholder="<h2>Nagłówek</h2><p>Treść posta po polsku...</p>" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="content_en" class="form-label">🇬🇧 Post content (EN) (HTML)</label>
                        <textarea id="content_en" name="content_en" class="form-textarea" rows="10" 
                                  placeholder="<h2>Heading</h2><p>English content (optional)...</p>"></textarea>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary btn-large">Dodaj post</button>
            </form>
        </div>

        <!-- Lista postów -->
        <div class="admin-section">
            <h2>Wszystkie posty (<?php echo count($allPosts); ?>)</h2>
            
            <?php if (empty($allPosts)): ?>
                <p>Brak postów. Dodaj pierwszy!</p>
            <?php else: ?>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Tytuł</th>
                            <th>Kategoria</th>
                            <th>Data publikacji</th>
                            <th>Wyświetlenia</th>
                            <th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($allPosts as $post): ?>
                            <tr>
                                <td>
                                    <strong><?php echo e($post['title']); ?></strong><br>
                                    <small style="color: var(--text-light);">/<?php echo e($post['slug']); ?></small>
                                </td>
                                <td><?php echo e($post['category_name'] ?: '-'); ?></td>
                                <td><?php echo formatDate($post['published_at']); ?></td>
                                <td><?php echo $post['views']; ?></td>
                                <td>
                                    <a href="post.php?slug=<?php echo e($post['slug']); ?>" class="btn btn-primary btn-small" target="_blank">Zobacz</a>
                                    <a href="admin.php?delete=<?php echo $post['id']; ?>" class="btn btn-danger btn-small" 
                                       onclick="return confirm('Czy na pewno chcesz usunąć ten post?')">Usuń</a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
    </div>

    <script>
        // Automatyczne generowanie slug z tytułu
        document.getElementById('title').addEventListener('input', function(e) {
            const slugInput = document.getElementById('slug');
            if (slugInput.value === '' || slugInput.dataset.auto !== 'false') {
                const slug = e.target.value
                    .toLowerCase()
                    .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
                    .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
                    .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                slugInput.value = slug;
                slugInput.dataset.auto = 'true';
            }
        });
        
        document.getElementById('slug').addEventListener('input', function() {
            this.dataset.auto = 'false';
        });
    </script>
</body>
</html>
