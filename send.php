<?php
/**
 * Frame Design — Обработчик заявок с сайта для хостинга Reg.ru
 * Отправляет заявки напрямую на framedesign39@mail.ru без сторонних сервисов и подтверждений.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Принимаем как JSON, так и стандартный POST
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!is_array($data) || empty($data)) {
    $data = $_POST;
}

$name  = isset($data['name'])  ? trim($data['name'])  : (isset($data['Имя']) ? trim($data['Имя']) : '');
$phone = isset($data['phone']) ? trim($data['phone']) : (isset($data['Телефон']) ? trim($data['Телефон']) : '');
$topic = isset($data['topic']) ? trim($data['topic']) : (isset($data['Направление']) ? trim($data['Направление']) : '');
$when  = isset($data['when'])  ? trim($data['when'])  : (isset($data['Удобное время']) ? trim($data['Удобное время']) : '');
$page  = isset($data['page'])  ? trim($data['page'])  : (isset($data['Страница']) ? trim($data['Страница']) : '');

// Валидация
if (empty($name) && empty($phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Заполните обязательные поля']);
    exit;
}

// Словарь направлений
$topicsMap = [
    'kitchen'  => 'Кухни',
    'living'   => 'Гостиная и ТВ-зона',
    'wardrobe' => 'Гардеробная система',
    'mirrors'  => 'Дизайнерские решения (тумбы, зеркала)',
    'complex'  => 'Комплексная меблировка',
    'designer' => 'Сотрудничество для дизайнеров'
];

if (isset($topicsMap[$topic])) {
    $topic = $topicsMap[$topic];
}

$to = 'framedesign39@mail.ru';
$subjectTitle = 'Новая заявка с сайта Frame Design' . ($name ? ': ' . $name : '');
$subject = '=?UTF-8?B?' . base64_encode($subjectTitle) . '?=';

$host = isset($_SERVER['HTTP_HOST']) ? preg_replace('/^www\./', '', $_SERVER['HTTP_HOST']) : 'framedesign.ru';
$fromEmail = 'no-reply@' . $host;
$dateStr = date('d.m.Y H:i');

$nameSafe  = htmlspecialchars($name ?: 'Не указано', ENT_QUOTES, 'UTF-8');
$phoneSafe = htmlspecialchars($phone ?: 'Не указан', ENT_QUOTES, 'UTF-8');
$topicSafe = htmlspecialchars($topic ?: 'Не указано', ENT_QUOTES, 'UTF-8');
$whenSafe  = htmlspecialchars($when ?: 'В ближайшее время', ENT_QUOTES, 'UTF-8');
$pageSafe  = htmlspecialchars($page ?: 'Главная страница', ENT_QUOTES, 'UTF-8');

$htmlMessage = "
<!DOCTYPE html>
<html>
<head>
  <meta charset=\"UTF-8\">
  <title>Новая заявка с сайта Frame Design</title>
</head>
<body style=\"margin:0; padding:24px; background-color:#141416; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;\">
  <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">
    <tr>
      <td align=\"center\">
        <table width=\"600\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px; width:100%; background:#1a1a1d; border:1px solid #b8965a; border-radius:8px; overflow:hidden;\">
          <tr>
            <td style=\"padding:28px 32px; background:#141416; border-bottom:1px solid rgba(184,150,90,0.3);\">
              <h2 style=\"margin:0; font-size:20px; font-weight:600; color:#b8965a; letter-spacing:1px; text-transform:uppercase;\">
                Frame Design — Новая заявка
              </h2>
            </td>
          </tr>
          <tr>
            <td style=\"padding:32px;\">
              <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">
                <tr>
                  <td style=\"padding:12px 0; color:#b8a888; font-size:14px; width:160px; border-bottom:1px solid rgba(255,255,255,0.06);\">Имя клиента:</td>
                  <td style=\"padding:12px 0; color:#ffffff; font-size:16px; font-weight:bold; border-bottom:1px solid rgba(255,255,255,0.06);\">{$nameSafe}</td>
                </tr>
                <tr>
                  <td style=\"padding:12px 0; color:#b8a888; font-size:14px; border-bottom:1px solid rgba(255,255,255,0.06);\">Телефон:</td>
                  <td style=\"padding:12px 0; color:#b8965a; font-size:18px; font-weight:bold; border-bottom:1px solid rgba(255,255,255,0.06);\">
                    <a href=\"tel:{$phoneSafe}\" style=\"color:#b8965a; text-decoration:none;\">{$phoneSafe}</a>
                  </td>
                </tr>
                <tr>
                  <td style=\"padding:12px 0; color:#b8a888; font-size:14px; border-bottom:1px solid rgba(255,255,255,0.06);\">Направление:</td>
                  <td style=\"padding:12px 0; color:#ffffff; font-size:14px; border-bottom:1px solid rgba(255,255,255,0.06);\">{$topicSafe}</td>
                </tr>
                <tr>
                  <td style=\"padding:12px 0; color:#b8a888; font-size:14px; border-bottom:1px solid rgba(255,255,255,0.06);\">Удобное время:</td>
                  <td style=\"padding:12px 0; color:#ffffff; font-size:14px; border-bottom:1px solid rgba(255,255,255,0.06);\">{$whenSafe}</td>
                </tr>
                <tr>
                  <td style=\"padding:12px 0; color:#b8a888; font-size:14px;\">Страница заявки:</td>
                  <td style=\"padding:12px 0; color:#ebe0c8; font-size:13px;\">{$pageSafe}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style=\"padding:20px 32px; background:#121214; border-top:1px solid rgba(255,255,255,0.06); font-size:12px; color:#777;\">
              Заявка отправлена: {$dateStr}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
";

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=utf-8\r\n";
$headers .= "From: Frame Design <{$fromEmail}>\r\n";
$headers .= "Reply-To: {$fromEmail}\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$sent = @mail($to, $subject, $htmlMessage, $headers);

echo json_encode([
    'success' => true,
    'message' => 'Заявка успешно отправлена'
]);
