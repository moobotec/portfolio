<?php
// carbon_service.php
// Service de calcul carbone (portfolio) + config JSON

define('CARBON_CONFIG_VERSION', 1);

function carbon_data_dir(): string {
    return __DIR__ . '/data';
}

function carbon_config_path(): string {
    return carbon_data_dir() . '/carbon_config.json';
}

function carbon_now_iso(): string {
    return date('c');
}

function carbon_default_config(): array {
    return [
        'version' => CARBON_CONFIG_VERSION,
        'updated_at' => carbon_now_iso(),
        'use_tracking' => true,
        'traffic_window_days' => 30,
        'fallback_pageviews_month' => 0,
        'avg_page_mb' => 1.5,
        'factor_kg_per_gb' => 0.06,
        'hosting_kg_year' => 15,
        'ai_prompts_count' => 0,
        'ai_wh_per_prompt' => 0.3,
        'grid_gco2_per_kwh' => 21.7,
        'km_bike_year' => 0,
        'km_walk_year' => 0,
        'factor_car_kg_km' => 0.218,
        'factors_source' => 'À compléter (sources des facteurs).',
        'factors_date' => date('Y-m-d')
    ];
}

function carbon_safe_float($value, float $default = 0.0): float {
    if ($value === null) return $default;
    if (is_string($value)) {
        $value = trim($value);
        if ($value === '') return $default;
        $value = str_replace(',', '.', $value);
    }
    if (!is_numeric($value)) return $default;
    return (float)$value;
}

function carbon_safe_int($value, int $default = 0): int {
    if ($value === null) return $default;
    if (is_string($value)) {
        $value = trim($value);
        if ($value === '') return $default;
    }
    if (!is_numeric($value)) return $default;
    return (int)$value;
}

function carbon_load_config(): array {
    $path = carbon_config_path();
    $defaults = carbon_default_config();
    if (!file_exists($path)) return $defaults;

    $raw = @file_get_contents($path);
    if (!$raw) return $defaults;

    $data = json_decode($raw, true);
    if (!is_array($data)) return $defaults;

    return array_merge($defaults, $data);
}

function carbon_validate_config(array $input, array &$errors): array {
    $cfg = carbon_default_config();

    $cfg['use_tracking'] = !empty($input['use_tracking']);
    $cfg['traffic_window_days'] = max(7, min(365, carbon_safe_int($input['traffic_window_days'], $cfg['traffic_window_days'])));
    $cfg['fallback_pageviews_month'] = max(0, carbon_safe_int($input['fallback_pageviews_month'], $cfg['fallback_pageviews_month']));
    $cfg['avg_page_mb'] = max(0, carbon_safe_float($input['avg_page_mb'], $cfg['avg_page_mb']));
    $cfg['factor_kg_per_gb'] = max(0, carbon_safe_float($input['factor_kg_per_gb'], $cfg['factor_kg_per_gb']));
    $cfg['hosting_kg_year'] = max(0, carbon_safe_float($input['hosting_kg_year'], $cfg['hosting_kg_year']));
    $cfg['ai_prompts_count'] = max(0, carbon_safe_int($input['ai_prompts_count'], $cfg['ai_prompts_count']));
    $cfg['ai_wh_per_prompt'] = max(0, carbon_safe_float($input['ai_wh_per_prompt'], $cfg['ai_wh_per_prompt']));
    $cfg['grid_gco2_per_kwh'] = max(0, carbon_safe_float($input['grid_gco2_per_kwh'], $cfg['grid_gco2_per_kwh']));
    $cfg['km_bike_year'] = max(0, carbon_safe_float($input['km_bike_year'], $cfg['km_bike_year']));
    $cfg['km_walk_year'] = max(0, carbon_safe_float($input['km_walk_year'], $cfg['km_walk_year']));
    $cfg['factor_car_kg_km'] = max(0, carbon_safe_float($input['factor_car_kg_km'], $cfg['factor_car_kg_km']));
    $cfg['factors_source'] = trim((string)($input['factors_source'] ?? $cfg['factors_source']));
    $cfg['factors_date'] = trim((string)($input['factors_date'] ?? $cfg['factors_date']));

    if ($cfg['traffic_window_days'] < 7 || $cfg['traffic_window_days'] > 365) {
        $errors[] = 'Fenêtre de trafic invalide (7-365 jours).';
    }
    if ($cfg['avg_page_mb'] > 50) {
        $errors[] = 'Poids moyen page trop élevé (max 50 MB).';
    }
    if ($cfg['factor_kg_per_gb'] > 5) {
        $errors[] = 'Facteur kg/GB trop élevé (max 5).';
    }
    if ($cfg['ai_wh_per_prompt'] > 50) {
        $errors[] = 'Wh par prompt trop élevé (max 50).';
    }
    if ($cfg['grid_gco2_per_kwh'] > 2000) {
        $errors[] = 'Facteur électricité trop élevé (max 2000 gCO2/kWh).';
    }
    if ($cfg['factor_car_kg_km'] > 1) {
        $errors[] = 'Facteur voiture trop élevé (max 1 kg/km).';
    }

    return $cfg;
}

function carbon_save_config(array $config, array &$errors): bool {
    $dir = carbon_data_dir();
    if (!is_dir($dir)) {
        if (!@mkdir($dir, 0755, true)) {
            $errors[] = 'Impossible de créer le dossier data.';
            return false;
        }
    }

    $config['version'] = CARBON_CONFIG_VERSION;
    $config['updated_at'] = carbon_now_iso();

    $path = carbon_config_path();
    $json = json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        $errors[] = 'JSON invalide.';
        return false;
    }

    $fp = @fopen($path, 'c+');
    if (!$fp) {
        $errors[] = 'Impossible d\'écrire le fichier de config.';
        return false;
    }

    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        $errors[] = 'Verrouillage du fichier impossible.';
        return false;
    }

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, $json);
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    return true;
}

function carbon_log_path_for_date(DateTimeImmutable $date): string {
    return __DIR__ . '/logs/visits-' . $date->format('Y-m-d') . '.log';
}

function carbon_count_pageviews(DateTimeImmutable $start, DateTimeImmutable $end): array {
    $count = 0;
    $days = 0;
    $files = 0;
    $missing = 0;
    $errors = 0;

    for ($d = $start; $d <= $end; $d = $d->modify('+1 day')) {
        $days += 1;
        $path = carbon_log_path_for_date($d);
        if (!file_exists($path)) {
            $missing += 1;
            continue;
        }
        $files += 1;
        $fh = @fopen($path, 'r');
        if (!$fh) {
            $errors += 1;
            continue;
        }
        while (($line = fgets($fh)) !== false) {
            $line = trim($line);
            if ($line === '') continue;
            $j = json_decode($line, true);
            if (!is_array($j)) continue;
            if (($j['event'] ?? '') === 'pageview') {
                $count += 1;
            }
        }
        fclose($fh);
    }

    return [
        'pageviews' => $count,
        'days' => $days,
        'files' => $files,
        'missing' => $missing,
        'errors' => $errors,
        'start' => $start->format('Y-m-d'),
        'end' => $end->format('Y-m-d')
    ];
}

function carbon_estimate_pageviews_month(array $config): array {
    if (empty($config['use_tracking'])) {
        return [
            'pageviews_month' => (int)$config['fallback_pageviews_month'],
            'source' => 'manual',
            'details' => null
        ];
    }

    $windowDays = max(7, min(365, (int)$config['traffic_window_days']));
    $end = new DateTimeImmutable('today');
    $start = $end->modify('-' . ($windowDays - 1) . ' days');

    $stats = carbon_count_pageviews($start, $end);
    if (($stats['files'] ?? 0) === 0) {
        return [
            'pageviews_month' => (int)$config['fallback_pageviews_month'],
            'source' => 'manual_fallback',
            'details' => $stats
        ];
    }

    $days = max(1, (int)$stats['days']);
    $pageviews = (int)$stats['pageviews'];
    $normalized = (int)round($pageviews * (30 / $days));

    return [
        'pageviews_month' => $normalized,
        'source' => 'tracking',
        'details' => $stats
    ];
}

function carbon_compute_kpis(array $config): array {
    $traffic = carbon_estimate_pageviews_month($config);
    $pageviewsMonth = (int)$traffic['pageviews_month'];

    $avgPageMb = (float)$config['avg_page_mb'];
    $annualMb = $pageviewsMonth * $avgPageMb * 12;
    $annualGb = $annualMb / 1024;
    $trafficKg = $annualGb * (float)$config['factor_kg_per_gb'];

    $hostingKg = (float)$config['hosting_kg_year'];

    $aiPrompts = (int)$config['ai_prompts_count'];
    $aiWhPerPrompt = (float)$config['ai_wh_per_prompt'];
    $gridGco2 = (float)$config['grid_gco2_per_kwh'];
    $aiKwh = ($aiPrompts * $aiWhPerPrompt) / 1000;
    $aiCo2G = $aiKwh * $gridGco2;
    $aiKg = $aiCo2G / 1000;

    $impactKg = $trafficKg + $hostingKg + $aiKg;

    $kmBike = (float)$config['km_bike_year'];
    $kmWalk = (float)$config['km_walk_year'];
    $avoidKg = ($kmBike + $kmWalk) * (float)$config['factor_car_kg_km'];

    $netKg = $impactKg - $avoidKg;

    return [
        'pageviews_month' => $pageviewsMonth,
        'traffic' => $traffic,
        'traffic_annual_gb' => $annualGb,
        'traffic_kg' => $trafficKg,
        'hosting_kg' => $hostingKg,
        'ai_kwh' => $aiKwh,
        'ai_kg' => $aiKg,
        'impact_kg' => $impactKg,
        'avoid_kg' => $avoidKg,
        'net_kg' => $netKg
    ];
}

function carbon_public_payload(): array {
    $config = carbon_load_config();
    $kpis = carbon_compute_kpis($config);

    return [
        'estimation' => true,
        'updated_at' => $config['updated_at'] ?? carbon_now_iso(),
        'factors_date' => $config['factors_date'] ?? '',
        'factors_source' => $config['factors_source'] ?? '',
        'factors' => [
            'factor_kg_per_gb' => (float)$config['factor_kg_per_gb'],
            'factor_car_kg_km' => (float)$config['factor_car_kg_km'],
            'avg_page_mb' => (float)$config['avg_page_mb'],
            'hosting_kg_year' => (float)$config['hosting_kg_year'],
            'ai_wh_per_prompt' => (float)$config['ai_wh_per_prompt'],
            'grid_gco2_per_kwh' => (float)$config['grid_gco2_per_kwh']
        ],
        'ai' => [
            'prompts_count' => (int)$config['ai_prompts_count'],
            'kwh' => (float)$kpis['ai_kwh'],
            'kg' => (float)$kpis['ai_kg']
        ],
        'mobility' => [
            'km_bike_year' => (float)$config['km_bike_year'],
            'km_walk_year' => (float)$config['km_walk_year']
        ],
        'traffic' => [
            'pageviews_month' => (int)$kpis['pageviews_month'],
            'annual_gb' => (float)$kpis['traffic_annual_gb'],
            'source' => $kpis['traffic']['source'] ?? 'unknown'
        ],
        'kpis' => [
            'impact_kg' => (float)$kpis['impact_kg'],
            'avoid_kg' => (float)$kpis['avoid_kg'],
            'net_kg' => (float)$kpis['net_kg']
        ]
    ];
}

function carbon_admin_payload(): array {
    $config = carbon_load_config();
    $kpis = carbon_compute_kpis($config);

    return [
        'config' => $config,
        'kpis' => $kpis
    ];
}
