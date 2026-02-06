<?php
declare(strict_types=1);

// Base config for the AIML engine (mutualized OVH: PHP only).
return [
    // Default language when no lang is provided.
    'default_lang' => 'fr',
    // AIML directories per language.
    'aiml_dirs_by_lang' => [
        'fr' => [__DIR__ . '/aiml_fr'],
        'en' => [__DIR__ . '/aiml_en'],
    ],
    // Fallback reply per language.
    'fallback_by_lang' => [
        'fr' => "Je n'ai pas compris.",
        'en' => "I didn't understand.",
    ],
    // RebeccaAIML-like configuration directory (optional).
    // Prefer local conf to ensure bot properties (name, master, etc.) are available.
    'conf_dir' => __DIR__ . '/conf',
    // Base directory for <learn> file paths (relative paths are resolved here).
    'learn_base_dir' => __DIR__,
    // Max recursion depth for <srai>.
    'max_recursion' => 10,
    // Safety: max response time per request (milliseconds).
    'max_response_time_ms' => 1500,
    // Cache engine to avoid reloading AIML on each request.
    'cache_enabled' => true,
    'cache_dir' => __DIR__ . '/../cache',
    'cache_ttl_sec' => 3600,
    'cache_version' => 7,
    // Debug logging.
    'debug_enabled' => false,
    'debug_log' => __DIR__ . '/../logs/aiml_debug.log',
    // Rate limiting.
    'rate_limit_dir' => __DIR__ . '/../cache/ratelimit',
    'rate_limit_max' => 30,
    'rate_limit_window_sec' => 60,
];
