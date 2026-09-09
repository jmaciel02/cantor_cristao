<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataPath = __DIR__ . '/../database/seeders/data/hymns-canonical.json';
if (!file_exists($dataPath)) {
    // Fallback to frontend data path if present
    $dataPath = __DIR__ . '/../../frontend/src/data/hymns-canonical.json';
}

function getHymnsData(string $path): array {
    static $cached = null;
    if ($cached !== null) return $cached;
    if (!file_exists($path)) return [];
    $cached = json_decode(file_get_contents($path), true) ?: [];
    return $cached;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Route matching
if ($uri === '/api/v1/content/version') {
    $hymns = getHymnsData($dataPath);
    $latestHash = !empty($hymns) ? $hymns[0]['content_hash'] : 'init';
    echo json_encode([
        'version' => '2026.09.09',
        'total_hymns' => count($hymns),
        'hash' => $latestHash,
        'updated_at' => date('c')
    ]);
    exit;
}

if ($uri === '/api/v1/categories') {
    $hymns = getHymnsData($dataPath);
    $categories = array_values(array_unique(array_column($hymns, 'category')));
    echo json_encode([
        'categories' => $categories
    ]);
    exit;
}

if ($uri === '/api/v1/hymns' || $uri === '/api/v1/hymns/') {
    $hymns = getHymnsData($dataPath);
    $summaries = array_map(function($h) {
        return [
            'id' => $h['id'],
            'number' => $h['number'],
            'title' => $h['title'],
            'first_line' => $h['first_line'],
            'category' => $h['category'],
            'author' => $h['author']
        ];
    }, $hymns);

    echo json_encode([
        'data' => $summaries,
        'total' => count($summaries)
    ]);
    exit;
}

if (preg_match('#^/api/v1/hymns/(\d+)$#', $uri, $matches)) {
    $id = (int)$matches[1];
    $hymns = getHymnsData($dataPath);
    foreach ($hymns as $h) {
        if ($h['number'] === $id) {
            echo json_encode(['data' => $h]);
            exit;
        }
    }
    http_response_code(404);
    echo json_encode(['error' => 'Hino não encontrado', 'number' => $id]);
    exit;
}

if ($uri === '/api/v1/search') {
    $q = trim($_GET['q'] ?? '');
    $hymns = getHymnsData($dataPath);
    if (empty($q)) {
        echo json_encode(['data' => array_slice($hymns, 0, 30)]);
        exit;
    }

    $qClean = mb_strtolower($q, 'UTF-8');
    $results = [];
    foreach ($hymns as $h) {
        if ((string)$h['number'] === $q || stripos($h['title'], $q) !== false || stripos($h['first_line'], $q) !== false) {
            $results[] = [
                'id' => $h['id'],
                'number' => $h['number'],
                'title' => $h['title'],
                'first_line' => $h['first_line'],
                'category' => $h['category']
            ];
            if (count($results) >= 40) break;
        }
    }

    echo json_encode(['data' => $results, 'count' => count($results), 'query' => $q]);
    exit;
}

// Default 404
http_response_code(404);
echo json_encode(['error' => 'Endpoint da API não encontrado', 'uri' => $uri]);
