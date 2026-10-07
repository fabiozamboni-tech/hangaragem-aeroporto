<?php
/**
 * VESPAIR CMS — API Segura (PHP Backend para Apache / HostGator)
 * Autenticação isolada sem banco de dados, backups automáticos e proteção contra invasões.
 */

// Desativa exibição direta de erros para não corromper respostas JSON
error_reporting(0);
@ini_set('display_errors', '0');

ob_start();

// Configurações
define('ADMIN_USER', 'admin');
define('ADMIN_PASS', 'nimda');
define('BACKUP_DIR', __DIR__ . '/backups');
define('SITE_INDEX', dirname(__DIR__) . '/index.html');
define('IMAGES_DIR', dirname(__DIR__) . '/images');
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCKOUT_TIME_SECONDS', 900); // 15 minutos

// Garante que os diretórios existam
if (!is_dir(BACKUP_DIR)) {
    @mkdir(BACKUP_DIR, 0755, true);
}
if (!is_dir(IMAGES_DIR)) {
    @mkdir(IMAGES_DIR, 0755, true);
}

// Configura diretório próprio de sessões dentro de backups (evita erros em servidores com sessão global do cPanel inacessível)
$session_dir = BACKUP_DIR . '/.sessions';
if (!is_dir($session_dir)) {
    @mkdir($session_dir, 0700, true);
}
if (is_dir($session_dir) && is_writable($session_dir)) {
    @session_save_path($session_dir);
}

// Configurações estritas de segurança de sessão
@ini_set('session.cookie_httponly', '1');
@ini_set('session.cookie_samesite', 'Strict');
@ini_set('session.use_only_cookies', '1');

@session_start();

// Limpa qualquer saída acidental antes de enviar cabeçalhos
if (ob_get_length()) {
    ob_clean();
}

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');

// Helpers de Rate Limiting contra Brute-Force
function check_rate_limit() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $rate_file = BACKUP_DIR . '/.rate_limit.json';
    $data = [];
    if (file_exists($rate_file)) {
        $content = @file_get_contents($rate_file);
        if ($content) {
            $data = json_decode($content, true) ?: [];
        }
    }
    
    $now = time();
    // Limpa entradas expiradas
    foreach ($data as $k => $v) {
        if (($now - ($v['last_attempt'] ?? 0)) > LOCKOUT_TIME_SECONDS) {
            unset($data[$k]);
        }
    }

    if (isset($data[$ip])) {
        if ($data[$ip]['attempts'] >= MAX_LOGIN_ATTEMPTS) {
            $remaining = LOCKOUT_TIME_SECONDS - ($now - $data[$ip]['last_attempt']);
            if ($remaining > 0) {
                http_response_code(429);
                echo json_encode([
                    'success' => false,
                    'message' => 'Muitas tentativas incorretas. Tente novamente em ' . ceil($remaining / 60) . ' minutos.'
                ]);
                exit;
            } else {
                $data[$ip] = ['attempts' => 0, 'last_attempt' => $now];
            }
        }
    }

    return [$rate_file, $data, $ip, $now];
}

function register_failed_attempt($rate_file, $data, $ip, $now) {
    if (!isset($data[$ip])) {
        $data[$ip] = ['attempts' => 1, 'last_attempt' => $now];
    } else {
        $data[$ip]['attempts']++;
        $data[$ip]['last_attempt'] = $now;
    }
    @file_put_contents($rate_file, json_encode($data), LOCK_EX);
}

function clear_failed_attempts($rate_file, $data, $ip) {
    if (isset($data[$ip])) {
        unset($data[$ip]);
        @file_put_contents($rate_file, json_encode($data), LOCK_EX);
    }
}

// Validação de Autenticação
function is_authenticated() {
    return isset($_SESSION['vespair_cms_logged']) && $_SESSION['vespair_cms_logged'] === true;
}

function require_auth() {
    if (!is_authenticated()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Sessão expirada ou não autenticada.']);
        exit;
    }
}

// Roteamento de Ações
$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'login':
        list($rate_file, $rate_data, $ip, $now) = check_rate_limit();
        
        $input = json_decode(file_get_contents('php://input'), true);
        $user = $input['username'] ?? $_POST['username'] ?? '';
        $pass = $input['password'] ?? $_POST['password'] ?? '';

        if (hash_equals(ADMIN_USER, $user) && hash_equals(ADMIN_PASS, $pass)) {
            clear_failed_attempts($rate_file, $rate_data, $ip);
            session_regenerate_id(true);
            $_SESSION['vespair_cms_logged'] = true;
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

            echo json_encode([
                'success' => true,
                'message' => 'Login realizado com sucesso.',
                'csrf_token' => $_SESSION['csrf_token']
            ]);
        } else {
            register_failed_attempt($rate_file, $rate_data, $ip, $now);
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Usuário ou senha inválidos.']);
        }
        break;

    case 'check':
        if (is_authenticated()) {
            if (empty($_SESSION['csrf_token'])) {
                $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
            }
            echo json_encode([
                'authenticated' => true,
                'csrf_token' => $_SESSION['csrf_token']
            ]);
        } else {
            echo json_encode(['authenticated' => false]);
        }
        break;

    case 'logout':
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Sessão encerrada.']);
        break;

    case 'save':
        require_auth();
        $input = json_decode(file_get_contents('php://input'), true);
        $content_data = $input['content'] ?? null;

        if (!$content_data || !is_array($content_data)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Dados de conteúdo inválidos.']);
            exit;
        }

        if (!file_exists(SITE_INDEX)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Arquivo index.html não encontrado.']);
            exit;
        }

        $current_html = file_get_contents(SITE_INDEX);
        $timestamp = date('Y-m-d_H-i-s');

        // Cria backup automático antes de salvar
        $backup_html_file = BACKUP_DIR . "/index_{$timestamp}.html";
        $backup_json_file = BACKUP_DIR . "/content_{$timestamp}.json";
        
        file_put_contents($backup_html_file, $current_html);
        file_put_contents($backup_json_file, json_encode([
            'timestamp' => $timestamp,
            'date_formatted' => date('d/m/Y H:i:s'),
            'content' => $content_data
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        // Injeta ou atualiza o bloco de dados do CMS no index.html
        $json_encoded = json_encode($content_data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $cms_script = "<script id=\"vespair-cms-data\">window.__VESPAIR_CONTENT__ = {$json_encoded};</script>";

        if (strpos($current_html, '<script id="vespair-cms-data">') !== false) {
            $new_html = preg_replace('/<script id="vespair-cms-data">.*?<\/script>/s', $cms_script, $current_html);
        } else {
            // Insere antes de </head>
            $new_html = str_replace('</head>', "  {$cms_script}\n</head>", $current_html);
        }

        file_put_contents(SITE_INDEX, $new_html);

        echo json_encode([
            'success' => true,
            'message' => 'Alterações salvas e backup gerado com sucesso.',
            'backup_id' => "index_{$timestamp}.html",
            'timestamp' => date('d/m/Y H:i:s')
        ]);
        break;

    case 'upload_image':
        require_auth();

        $input = json_decode(file_get_contents('php://input'), true);
        $base64_data = $input['image_base64'] ?? null;
        $target_w = intval($input['target_width'] ?? $_POST['target_width'] ?? 0);
        $target_h = intval($input['target_height'] ?? $_POST['target_height'] ?? 0);

        if ($base64_data) {
            if (preg_match('/^data:image\/(jpeg|png|webp);base64,(.+)$/', $base64_data, $matches)) {
                $ext = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
                $raw_bytes = base64_decode($matches[2]);
                if (!$raw_bytes) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Falha ao decodificar imagem base64.']);
                    exit;
                }
                $new_filename = 'cms_' . date('Ymd_His') . '_' . substr(md5(uniqid()), 0, 6) . '.' . $ext;
                $destination = IMAGES_DIR . '/' . $new_filename;
                file_put_contents($destination, $raw_bytes);
                echo json_encode([
                    'success' => true,
                    'message' => 'Imagem enviada e adaptada com sucesso.',
                    'image_url' => './images/' . $new_filename,
                    'filename' => $new_filename
                ]);
                exit;
            }
        }

        if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Nenhum arquivo enviado ou erro no upload.']);
            exit;
        }

        $file = $_FILES['image'];
        $tmp_name = $file['tmp_name'];
        $orig_name = $file['name'];

        // Validação de extensão
        $ext = strtolower(pathinfo($orig_name, PATHINFO_EXTENSION));
        $allowed_exts = ['jpg', 'jpeg', 'png', 'webp'];
        if (!in_array($ext, $allowed_exts)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Extensão não permitida. Apenas JPG, PNG e WebP são aceitos.']);
            exit;
        }

        // Validação rigorosa de MIME-type binário
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $tmp_name);
        finfo_close($finfo);

        $allowed_mimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($mime, $allowed_mimes)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Arquivo inválido ou corrompido.']);
            exit;
        }

        // Verifica dimensões alvo enviadas para redimensionamento automático
        $target_w = isset($_POST['target_width']) ? intval($_POST['target_width']) : 0;
        $target_h = isset($_POST['target_height']) ? intval($_POST['target_height']) : 0;

        $clean_basename = preg_replace('/[^a-z0-9_-]/i', '', pathinfo($orig_name, PATHINFO_FILENAME));
        if (empty($clean_basename)) $clean_basename = 'cms_img';
        $new_filename = 'cms_' . date('Ymd_His') . '_' . substr(md5(uniqid()), 0, 6) . '.' . $ext;
        $destination = IMAGES_DIR . '/' . $new_filename;

        // Processa redimensionamento se dimensões forem fornecidas e GD estiver disponível
        $resized = false;
        if ($target_w > 0 && $target_h > 0 && extension_loaded('gd')) {
            list($orig_w, $orig_h) = getimagesize($tmp_name);
            if ($orig_w > 0 && $orig_h > 0) {
                switch ($mime) {
                    case 'image/jpeg': $src_img = @imagecreatefromjpeg($tmp_name); break;
                    case 'image/png': $src_img = @imagecreatefrompng($tmp_name); break;
                    case 'image/webp': $src_img = @imagecreatefromwebp($tmp_name); break;
                    default: $src_img = false;
                }

                if ($src_img) {
                    $dst_img = imagecreatetruecolor($target_w, $target_h);
                    
                    // Preserva transparência para PNG e WebP
                    if ($mime === 'image/png' || $mime === 'image/webp') {
                        imagealphablending($dst_img, false);
                        imagesavealpha($dst_img, true);
                    }

                    // Enquadramento proporcional tipo cover
                    $src_aspect = $orig_w / $orig_h;
                    $target_aspect = $target_w / $target_h;

                    if ($src_aspect > $target_aspect) {
                        $src_crop_h = $orig_h;
                        $src_crop_w = intval($orig_h * $target_aspect);
                        $src_x = intval(($orig_w - $src_crop_w) / 2);
                        $src_y = 0;
                    } else {
                        $src_crop_w = $orig_w;
                        $src_crop_h = intval($orig_w / $target_aspect);
                        $src_x = 0;
                        $src_y = intval(($orig_h - $src_crop_h) / 2);
                    }

                    imagecopyresampled($dst_img, $src_img, 0, 0, $src_x, $src_y, $target_w, $target_h, $src_crop_w, $src_crop_h);

                    switch ($ext) {
                        case 'jpg':
                        case 'jpeg':
                            imagejpeg($dst_img, $destination, 90);
                            break;
                        case 'png':
                            imagepng($dst_img, $destination, 8);
                            break;
                        case 'webp':
                            imagewebp($dst_img, $destination, 88);
                            break;
                    }

                    imagedestroy($src_img);
                    imagedestroy($dst_img);
                    $resized = true;
                }
            }
        }

        if (!$resized) {
            move_uploaded_file($tmp_name, $destination);
        }

        echo json_encode([
            'success' => true,
            'message' => 'Imagem enviada e adaptada com sucesso.',
            'image_url' => './images/' . $new_filename,
            'filename' => $new_filename
        ]);
        break;

    case 'backups':
        require_auth();
        $files = glob(BACKUP_DIR . '/content_*.json');
        $backups = [];

        foreach ($files as $file) {
            $data = json_decode(file_get_contents($file), true);
            $filename = basename($file);
            $id = str_replace(['content_', '.json'], '', $filename);
            $html_file = "index_{$id}.html";
            
            if (file_exists(BACKUP_DIR . "/{$html_file}")) {
                $backups[] = [
                    'id' => $id,
                    'html_file' => $html_file,
                    'timestamp' => $data['timestamp'] ?? $id,
                    'date_formatted' => $data['date_formatted'] ?? date('d/m/Y H:i:s', filemtime($file)),
                    'size_kb' => round(filesize(BACKUP_DIR . "/{$html_file}") / 1024, 1)
                ];
            }
        }

        // Ordena do mais recente para o mais antigo
        usort($backups, function($a, $b) {
            return strcmp($b['timestamp'], $a['timestamp']);
        });

        echo json_encode(['success' => true, 'backups' => $backups]);
        break;

    case 'restore_backup':
        require_auth();
        $input = json_decode(file_get_contents('php://input'), true);
        $id = preg_replace('/[^a-zA-Z0-9_-]/', '', $input['id'] ?? '');

        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Identificador de backup inválido.']);
            exit;
        }

        $backup_target = BACKUP_DIR . "/index_{$id}.html";
        if (!file_exists($backup_target)) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Arquivo de backup não encontrado.']);
            exit;
        }

        // Cria backup do estado atual antes de reverter
        if (file_exists(SITE_INDEX)) {
            $current_html = file_get_contents(SITE_INDEX);
            $safety_time = date('Y-m-d_H-i-s');
            file_put_contents(BACKUP_DIR . "/index_pre_restore_{$safety_time}.html", $current_html);
        }

        // Restaura o index.html
        $restored_content = file_get_contents($backup_target);
        file_put_contents(SITE_INDEX, $restored_content);

        echo json_encode([
            'success' => true,
            'message' => 'Backup restaurado com sucesso.',
            'restored_id' => $id
        ]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Ação não especificada ou inválida.']);
        break;
}
