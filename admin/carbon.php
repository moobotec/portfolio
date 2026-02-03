<?php
require_once __DIR__ . '/../carbon_service.php';

$errors = [];
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $cfg = carbon_validate_config($_POST, $errors);
    if (!$errors) {
        if (carbon_save_config($cfg, $errors)) {
            $success = true;
        }
    }
}

$payload = carbon_admin_payload();
$config = $payload['config'];
$kpis = $payload['kpis'];
$traffic = $kpis['traffic'] ?? [];
$details = $traffic['details'] ?? null;

function h($s){ return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function fnum($v, $d = 2){ return number_format((float)$v, $d, ',', ' '); }

?><!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Admin — Bilan carbone</title>
  <style>
    :root{
      --bg0:#0e1116;
      --bg1:#111827;
      --card:rgba(255,255,255,.06);
      --border:rgba(255,255,255,.12);
      --text:#eef2ff;
      --muted:rgba(238,242,255,.7);
      --accent:#22d3ee;
      --accent2:#f59e0b;
      --shadow:0 18px 40px rgba(0,0,0,.35);
    }
    *{box-sizing:border-box}
    body{
      font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial, sans-serif;
      margin:0;
      padding:22px;
      background: var(--bg0);
      color:var(--text);
      min-height: 100vh;
    }
    h1{font-size:1.2rem;margin:0 0 12px}
    h2{font-size:1rem;margin:0 0 10px}
    .grid{display:grid;grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));gap:14px;align-items:start}
    .card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:14px;box-shadow:var(--shadow)}
    .muted{color:var(--muted)}
    .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}
    .kpi{padding:10px 12px;border-radius:12px;border:1px solid var(--border);background:linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,.03))}
    .kpi .value{font-size:1.15rem;font-weight:800}
    .kpi .label{font-size:.8rem;color:var(--muted)}
    label{display:block;font-size:.85rem;color:var(--muted);margin-bottom:4px}
    input, textarea, select{
      width:100%;padding:8px 10px;border-radius:10px;border:1px solid var(--border);
      background:rgba(255,255,255,.04);color:var(--text)
    }
    textarea{min-height:70px}
    .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
    .btn{
      background:linear-gradient(135deg,var(--accent),var(--accent2));
      border:none;border-radius:10px;padding:10px 14px;color:#0b1220;font-weight:700;cursor:pointer
    }
    .note{font-size:.85rem;color:var(--muted)}
    .alert{padding:10px 12px;border-radius:10px;margin-bottom:10px}
    .alert-success{background:rgba(34,211,238,.15);border:1px solid rgba(34,211,238,.35)}
    .alert-error{background:rgba(248,113,113,.15);border:1px solid rgba(248,113,113,.35)}
    .hr{height:1px;background:rgba(255,255,255,.08);margin:12px 0}
    .pill{display:inline-block;padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid var(--border)}
    ul{padding-left:18px;margin:6px 0}
    code{background:rgba(255,255,255,.08);padding:2px 6px;border-radius:6px}
  </style>
</head>
<body>
  <h1>Admin — Bilan Carbone du portfolio</h1>

  <?php if ($success): ?>
    <div class="alert alert-success">Configuration enregistrée.</div>
  <?php endif; ?>

  <?php if ($errors): ?>
    <div class="alert alert-error">
      <strong>Erreurs :</strong>
      <ul>
        <?php foreach ($errors as $e): ?><li><?= h($e) ?></li><?php endforeach; ?>
      </ul>
    </div>
  <?php endif; ?>

  <div class="grid">
    <div class="card">
      <h2>KPIs (estimation annuelle)</h2>
      <div class="kpis">
        <div class="kpi"><div class="value"><?= fnum($kpis['impact_kg'], 2) ?> kg</div><div class="label">Impact portfolio</div></div>
        <div class="kpi"><div class="value"><?= fnum($kpis['avoid_kg'], 2) ?> kg</div><div class="label">Émissions évitées</div></div>
        <div class="kpi"><div class="value"><?= fnum($kpis['net_kg'], 2) ?> kg</div><div class="label">Net</div></div>
      </div>
      <div class="hr"></div>
      <div class="note">Pageviews/mois estimées : <strong><?= (int)$kpis['pageviews_month'] ?></strong></div>
      <div class="note">Trafic annuel : <?= fnum($kpis['traffic_annual_gb'], 2) ?> GB • CO2 trafic : <?= fnum($kpis['traffic_kg'], 2) ?> kg</div>
      <div class="note">Hébergement : <?= fnum($kpis['hosting_kg'], 2) ?> kg</div>
      <div class="note">Impact IA : <?= fnum($kpis['ai_kg'], 4) ?> kg</div>
      <div class="note">Mobilité douce : <?= fnum($config['km_bike_year'], 1) ?> km vélo + <?= fnum($config['km_walk_year'], 1) ?> km marche</div>
      <div class="note">Source trafic : <span class="pill"><?= h($traffic['source'] ?? 'unknown') ?></span></div>
      <?php if ($details): ?>
        <div class="note">Fenêtre : <?= h($details['start']) ?> → <?= h($details['end']) ?> (<?= (int)$details['days'] ?> jours, <?= (int)$details['files'] ?> fichiers, <?= (int)$details['missing'] ?> manquants)</div>
      <?php endif; ?>
    </div>

    <div class="card">
      <h2>Configuration</h2>
      <form method="post">
        <div class="row">
          <div>
            <label>Facteur voiture (kgCO2e/km)</label>
            <input name="factor_car_kg_km" type="text" value="<?= h($config['factor_car_kg_km']) ?>">
          </div>
          <div>
            <label>Facteur trafic (kgCO2e/GB)</label>
            <input name="factor_kg_per_gb" type="text" value="<?= h($config['factor_kg_per_gb']) ?>">
          </div>
        </div>

        <div class="row">
          <div>
            <label>Poids moyen page (MB)</label>
            <input name="avg_page_mb" type="text" value="<?= h($config['avg_page_mb']) ?>">
          </div>
          <div>
            <label>Hébergement / infra (kgCO2e/an)</label>
            <input name="hosting_kg_year" type="text" value="<?= h($config['hosting_kg_year']) ?>">
          </div>
        </div>

        <div class="row">
          <div>
            <label>Prompts IA (nombre)</label>
            <input name="ai_prompts_count" type="number" min="0" value="<?= h($config['ai_prompts_count']) ?>">
          </div>
          <div>
            <label>Wh / prompt (défaut 0,3 — prudent 3,0)</label>
            <input name="ai_wh_per_prompt" type="text" value="<?= h($config['ai_wh_per_prompt']) ?>">
          </div>
        </div>

        <div class="row">
          <div>
            <label>Facteur électricité (gCO2e/kWh)</label>
            <input name="grid_gco2_per_kwh" type="text" value="<?= h($config['grid_gco2_per_kwh']) ?>">
          </div>
          <div>
            <label>Impact IA estimé (kgCO2e/an)</label>
            <input type="text" value="<?= fnum($kpis['ai_kg'], 4) ?>" readonly>
          </div>
        </div>

        <div class="row">
          <div>
            <label>Km vélo / an</label>
            <input name="km_bike_year" type="text" value="<?= h($config['km_bike_year']) ?>">
          </div>
          <div>
            <label>Km marche / an</label>
            <input name="km_walk_year" type="text" value="<?= h($config['km_walk_year']) ?>">
          </div>
        </div>

        <div class="row-3">
          <div>
            <label>Utiliser tracking</label>
            <select name="use_tracking">
              <option value="1" <?= !empty($config['use_tracking']) ? 'selected' : '' ?>>Oui</option>
              <option value="0" <?= empty($config['use_tracking']) ? 'selected' : '' ?>>Non</option>
            </select>
          </div>
          <div>
            <label>Fenêtre trafic (jours)</label>
            <input name="traffic_window_days" type="number" min="7" max="365" value="<?= h($config['traffic_window_days']) ?>">
          </div>
          <div>
            <label>Pages vues/mois (fallback)</label>
            <input name="fallback_pageviews_month" type="number" min="0" value="<?= h($config['fallback_pageviews_month']) ?>">
          </div>
        </div>

        <div class="row">
          <div>
            <label>Date des facteurs (YYYY-MM-DD)</label>
            <input name="factors_date" type="text" value="<?= h($config['factors_date']) ?>">
          </div>
          <div>
            <label>Sources des facteurs</label>
            <textarea name="factors_source"><?= h($config['factors_source']) ?></textarea>
          </div>
        </div>

        <div class="hr"></div>
        <button class="btn" type="submit">Enregistrer</button>
        <div class="note" style="margin-top:8px;">Dernière mise à jour: <?= h($config['updated_at'] ?? '') ?></div>
      </form>
    </div>

    <div class="card">
      <h2>Méthodologie (résumé)</h2>
      <ul class="muted">
        <li>Impact trafic = pages_vues_mois × poids_moyen_page_mb × 12 → GB/an × facteur kgCO2e/GB.</li>
        <li>Impact hébergement = forfait annuel (kgCO2e/an).</li>
        <li>Impact IA = prompts × Wh/prompt → kWh × facteur élec (gCO2/kWh).</li>
        <li>Évité = (km vélo + km marche) × facteur voiture (kgCO2e/km).</li>
        <li>Net = impact − évité (objectif atteint si ≤ 0).</li>
      </ul>
      <div class="hr"></div>
      <div class="note">Cette page expose uniquement des données agrégées. Estimation indicative, pas un audit.</div>
      <div class="note">Endpoint public: <code>/api/carbon.php</code></div>
    </div>
  </div>
</body>
</html>
