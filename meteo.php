<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$settings = [
    'api_key' => '704ff500e497dc0a45ac029d5f43f3aa',
    'weather_url' => 'https://api.openweathermap.org/data/2.5/weather',
    'forecast_url' => 'https://api.openweathermap.org/data/2.5/forecast',
    'units' => 'metric',
    'icon_mapping' => [
        '01d' => 'wi:day-sunny',
        '01n' => 'wi:day-sunny',
        '02d' => 'wi:day-cloudy',
        '02n' => 'wi:day-cloudy',
        '03d' => 'wi:cloud',
        '03n' => 'wi:cloud',
        '04d' => 'wi:cloudy',
        '04n' => 'wi:cloudy',
        '09d' => 'wi:rain',
        '09n' => 'wi:rain',
        '10d' => 'wi:day-rain',
        '10n' => 'wi:day-rain',
        '11d' => 'wi:thunderstorm',
        '11n' => 'wi:thunderstorm',
        '13d' => 'wi:snow',
        '13n' => 'wi:snow',
        '50d' => 'wi:fog',
        '50n' => 'wi:fog',
    ],
    'dow' => ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'],
];

$city = isset($_GET['city']) ? trim((string)$_GET['city']) : 'Limoges ,FR';
if ($city === '') {
    $city = 'Limoges ,FR';
}

function build_query(array $params): string
{
    return '?' . http_build_query($params);
}

function request_json(string $url): array
{
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_FAILONERROR => false,
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    $raw = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $err = curl_error($ch);
    if (is_resource($ch)) { curl_close($ch); }

    if ($raw === false || $status < 200 || $status >= 400) {
        throw new RuntimeException($err !== '' ? $err : ('HTTP ' . $status));
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        throw new RuntimeException('Invalid JSON from API');
    }
    return $data;
}

function icon_with_highest_occurrence(array $icons): string
{
    $counts = [];
    foreach ($icons as $icon) {
        $counts[$icon] = ($counts[$icon] ?? 0) + 1;
    }
    arsort($counts);
    return (string)array_key_first($counts);
}

try {
    $params = [
        'q' => $city,
        'APPID' => $settings['api_key'],
        'units' => $settings['units'],
    ];
    $weather = request_json($settings['weather_url'] . build_query($params));
    $forecast = request_json($settings['forecast_url'] . build_query($params));

    $todayUtc = (new DateTime('now', new DateTimeZone('UTC')))->format('Y-m-d');
    $fs = [];
    foreach ($forecast['list'] ?? [] as $f) {
        $date = substr((string)($f['dt_txt'] ?? ''), 0, 10);
        if ($date === '' || $date === $todayUtc) {
            continue;
        }
        if (!isset($fs[$date])) {
            $dowIndex = (int)(new DateTime($date))->format('w');
            $fs[$date] = [
                'dow' => $settings['dow'][$dowIndex] ?? '',
                'temp_max' => $f['main']['temp_max'] ?? null,
                'temp_min' => $f['main']['temp_min'] ?? null,
                'icons' => [$f['weather'][0]['icon'] ?? ''],
            ];
        } else {
            $fs[$date]['temp_max'] = max((float)$fs[$date]['temp_max'], (float)($f['main']['temp_max'] ?? 0));
            $fs[$date]['temp_min'] = min((float)$fs[$date]['temp_min'], (float)($f['main']['temp_min'] ?? 0));
            $fs[$date]['icons'][] = $f['weather'][0]['icon'] ?? '';
        }
    }

    $forecast_items = [];
    foreach ($fs as $day) {
        $iconKey = icon_with_highest_occurrence($day['icons']);
        $forecast_items[] = [
            'dow' => $day['dow'],
            'temp_max' => isset($day['temp_max']) ? round((float)$day['temp_max']) : null,
            'temp_min' => isset($day['temp_min']) ? round((float)$day['temp_min']) : null,
            'icon' => $settings['icon_mapping'][$iconKey] ?? null,
        ];
    }

    $iconKey = $weather['weather'][0]['icon'] ?? '';
    $response = [
        'city' => $weather['name'] ?? $city,
        'temp_current' => isset($weather['main']['temp']) ? round((float)$weather['main']['temp']) : null,
        'pressure' => $weather['main']['pressure'] ?? null,
        'humidity' => $weather['main']['humidity'] ?? null,
        'wind' => $weather['wind']['speed'] ?? null,
        'icon' => $settings['icon_mapping'][$iconKey] ?? null,
        'forecast' => $forecast_items,
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(502);
    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
