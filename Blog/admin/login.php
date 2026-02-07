<?php
require_once '../includes/config.php';

$error = '';

// Obsługa logowania
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (!empty($username) && !empty($password)) {
        global $pdo;
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username OR email = :username");
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch();
        
        // Sprawdź hasło (domyślnie admin/admin123)
        if ($user && password_verify($password, $user['password_hash'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];
            
            header('Location: admin.php');
            exit;
        } else {
            $error = t('invalid_credentials');
        }
    } else {
        $error = t('fill_all_fields');
    }
}

// Jeśli już zalogowany, przekieruj do admina
if (isset($_SESSION['user_id'])) {
    header('Location: admin.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logowanie - <?php echo SITE_TITLE; ?></title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <style>
        .login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
            padding: 20px;
        }
        .login-box {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: var(--shadow-lg);
            max-width: 400px;
            width: 100%;
        }
        .login-logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .login-logo h1 {
            color: var(--primary-color);
            margin-bottom: 10px;
        }
        .login-logo p {
            color: var(--text-light);
        }
        .alert {
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            background-color: #fee2e2;
            color: #991b1b;
            border: 1px solid #f87171;
        }
        .form-footer {
            margin-top: 20px;
            text-align: center;
        }
        .form-footer a {
            color: var(--primary-color);
            text-decoration: none;
        }
        .form-footer a:hover {
            text-decoration: underline;
        }
        .credentials-hint {
            background-color: #fef3c7;
            border: 1px solid #fbbf24;
            color: #92400e;
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-box">
            <div class="login-logo">
                <h1>🔐 <?php echo t('login_panel'); ?></h1>
                <p><?php echo t('login_subtitle'); ?></p>
            </div>

            <?php langSwitcher(); ?>

            <?php if ($error): ?>
                <div class="alert"><?php echo e($error); ?></div>
            <?php endif; ?>

            <form method="POST">
                <div class="form-group">
                    <label for="username" class="form-label"><?php echo t('username_or_email'); ?></label>
                    <input type="text" id="username" name="username" class="form-input" 
                           placeholder="admin" required autofocus>
                </div>

                <div class="form-group">
                    <label for="password" class="form-label"><?php echo t('password'); ?></label>
                    <input type="password" id="password" name="password" class="form-input" 
                           placeholder="••••••••" required>
                </div>

                <button type="submit" class="btn btn-primary btn-large" style="width: 100%;">
                    <?php echo t('login'); ?>
                </button>
            </form>

            <div class="credentials-hint">
                <strong>⚠️ <?php echo t('default_credentials'); ?>:</strong><br>
                Login: <code>admin</code><br>
                <?php echo t('password'); ?>: <code>admin123</code><br>
                <small><?php echo t('change_password'); ?></small>
            </div>

            <div class="form-footer">
                <a href="../index.php">← <?php echo t('return_home'); ?></a>
            </div>
        </div>
    </div>
</body>
</html>
