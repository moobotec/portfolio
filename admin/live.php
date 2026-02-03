<?php
$logDir = __DIR__ . '/../logs';
$files = glob($logDir . '/visits-*.log') ?: [];
rsort($files, SORT_STRING);
$fileNames = array_map('basename', $files);

$todayName = 'visits-' . date('Y-m-d') . '.log';
$selected = isset($_GET['file']) ? basename((string)$_GET['file']) : $todayName;
if (!in_array($selected, $fileNames, true)) {
    $selected = $fileNames[0] ?? $todayName;
}
$file = $logDir . '/' . $selected;
$lines = [];

if (file_exists($file)) {
    $data = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $lines = array_slice($data, -200);
    $lines = array_reverse($lines);
}

function h($s){ return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

if (isset($_GET['json'])) {
    header('Content-Type: application/json; charset=utf-8');
    $rows = [];
    foreach ($lines as $l) {
        $j = json_decode($l, true);
        if (!$j) continue;
        $rows[] = $j;
    }
    echo json_encode(['rows' => $rows], JSON_UNESCAPED_UNICODE);
    exit;
}

?><!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Live — activité</title>
  <style>
    :root{
      --bg0:#0e1116;
      --bg1:#111827;
      --bg2:#0b1220;
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
    header{
      display:flex;
      gap:12px;
      align-items:center;
      justify-content:space-between;
      margin-bottom:16px;
      flex-wrap:wrap;
    }
    h1{font-size:1.15rem;margin:0;letter-spacing:.01em}
    .pill{display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid var(--border)}
    .grid{
      display:grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap:14px;
      align-items:start;
    }
    .stack{
      display:grid;
      gap:14px;
      align-content:start;
    }
    .card{
      background:var(--card);
      border:1px solid var(--border);
      border-radius:16px;
      padding:12px;
      box-shadow:var(--shadow);
      backdrop-filter: blur(6px);
      height:auto;
    }
    .muted{color:var(--muted)}
    .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px}
    .kpi{
      padding:10px 12px;border-radius:12px;border:1px solid var(--border);
      background:linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
    }
    .kpi .value{font-size:1.1rem;font-weight:800}
    .kpi .label{font-size:.8rem;color:var(--muted)}
    .chart{display:grid;grid-template-columns:1fr;gap:8px;margin-top:12px}
    .bar{display:grid;grid-template-columns:120px 1fr 44px;gap:8px;align-items:center}
    .bar .label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .bar .track{height:10px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}
    .bar .fill{height:100%;background:linear-gradient(135deg,var(--accent),var(--accent2))}
    table{width:100%;border-collapse:collapse}
    th,td{padding:8px;border-bottom:1px solid rgba(255,255,255,.08);vertical-align:top}
    th{text-align:left;color:var(--muted);font-weight:600}
    .evt{font-weight:700}
    .page{opacity:.9}
    .row-meta{font-size:.85rem;color:var(--muted)}
  </style>
</head>
<body>
  <header>
    <h1>Live — activité</h1>
    <div class="muted">Mise à jour auto toutes les 60s • <span id="lastUpdate">—</span></div>
    <div>
      <label for="logSelect" class="muted" style="margin-right:6px;">Fichier :</label>
      <select id="logSelect">
        <?php foreach ($fileNames as $name): ?>
          <option value="<?= h($name) ?>" <?= $name === $selected ? 'selected' : '' ?>>
            <?= h($name) ?>
          </option>
        <?php endforeach; ?>
      </select>
    </div>
    <div>
      <label for="ipFilter" class="muted" style="margin-right:6px;">IP :</label>
      <select id="ipFilter">
        <option value="">Toutes</option>
      </select>
    </div>
    <div>
      <label for="countryFilter" class="muted" style="margin-right:6px;">Pays :</label>
      <select id="countryFilter">
        <option value="">Tous</option>
      </select>
    </div>
  </header>

  <div class="grid">
    <div class="stack">
      <div class="card">
        <div class="kpis">
          <div class="kpi">
            <div class="value" id="kpiTotal">0</div>
            <div class="label">Évènements</div>
          </div>
          <div class="kpi">
            <div class="value" id="kpiUsers">0</div>
            <div class="label">IPs uniques</div>
          </div>
          <div class="kpi">
            <div class="value" id="kpiConsent">0</div>
            <div class="label">Consentements</div>
          </div>
          <div class="kpi">
            <div class="value" id="kpiClicks">0</div>
            <div class="label">Clics</div>
          </div>
        </div>

      <div class="chart">
        <div class="muted">Répartition par évènement</div>
        <div id="eventBars"></div>
      </div>

      <div class="chart">
        <div class="muted">Répartition par pays</div>
        <div id="countryBars"></div>
      </div>

      <div class="chart">
        <div class="muted">Répartition par IP</div>
        <div id="ipBars"></div>
      </div>
    </div>

      <div class="card">
        <div class="muted">Clics par heure</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:8px;">
          <canvas id="clicksPie" width="220" height="220" style="max-width:220px;"></canvas>
          <ul id="clicksLegend" style="margin:0;padding-left:16px;"></ul>
        </div>
      </div>

      <div class="card">
        <div class="muted">Évènements par heure</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:8px;">
          <canvas id="eventsHourBar" width="260" height="160" style="max-width:260px;"></canvas>
          <ul id="eventsHourLegend" style="margin:0;padding-left:16px;"></ul>
        </div>
      </div>
    </div>

    <div class="stack">
      <div class="card">
        <div class="muted">Détails récents</div>
        <table>
          <thead>
            <tr>
              <th>Heure</th>
              <th>Évènement</th>
              <th>Contexte</th>
            </tr>
          </thead>
          <tbody id="rows"></tbody>
        </table>
        <div class="row-meta" style="display:flex;align-items:center;gap:10px;justify-content:flex-end;margin-top:8px;">
          <button class="btn" id="prevPage" type="button">Précédent</button>
          <span id="pageInfo" class="muted">Page 1 / 1</span>
          <button class="btn" id="nextPage" type="button">Suivant</button>
        </div>
      </div>

    </div>
  </div>

  <script>
    const fmtTime = (ts) => {
      if (!ts) return "—";
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts;
      return d.toLocaleTimeString("fr-FR");
    };

    const renderBars = (counts) => {
      const container = document.getElementById("eventBars");
      if (!container) return;
      const entries = Object.entries(counts).sort((a,b) => b[1]-a[1]);
      const max = entries[0]?.[1] || 1;
      container.innerHTML = entries.map(([label, value]) => {
        const w = Math.round((value / max) * 100);
        return `
          <div class="bar">
            <div class="label">${label}</div>
            <div class="track"><div class="fill" style="width:${w}%"></div></div>
            <div class="muted">${value}</div>
          </div>
        `;
      }).join("");
    };

    let allRows = [];
    let currentPage = 1;
    const pageSize = 20;

    const renderRows = (rows) => {
      const tbody = document.getElementById("rows");
      if (!tbody) return;
      tbody.innerHTML = rows.map((j) => {
        const evt = j.event || "";
        const ctxParts = [];
        if (j.page) ctxParts.push(`<div class="page">${j.page}</div>`);
        if (j.section) ctxParts.push(`<div class="row-meta">section: ${j.section}</div>`);
        if (j.href) ctxParts.push(`<div class="row-meta">href: ${j.href}</div>`);
        if (j.label) ctxParts.push(`<div class="row-meta">label: ${j.label}</div>`);
        if (j.decision) ctxParts.push(`<div class="row-meta">consent: ${j.decision}</div>`);
        return `
          <tr>
            <td class="muted">${fmtTime(j.ts)}</td>
            <td>
              <div class="evt">${evt}</div>
              <div class="row-meta">${j.country || "—"} • ${j.lang || "—"}</div>
            </td>
            <td>${ctxParts.join("")}</td>
          </tr>
        `;
      }).join("");
    };

    const renderCountryBars = (counts) => {
      const container = document.getElementById("countryBars");
      if (!container) return;
      const entries = Object.entries(counts).sort((a,b) => b[1]-a[1]);
      const max = entries[0]?.[1] || 1;
      container.innerHTML = entries.map(([label, value]) => {
        const w = Math.round((value / max) * 100);
        return `
          <div class="bar">
            <div class="label">${label}</div>
            <div class="track"><div class="fill" style="width:${w}%"></div></div>
            <div class="muted">${value}</div>
          </div>
        `;
      }).join("");
    };

    const renderIpBars = (counts) => {
      const container = document.getElementById("ipBars");
      if (!container) return;
      const entries = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0, 10);
      const max = entries[0]?.[1] || 1;
      container.innerHTML = entries.map(([label, value]) => {
        const w = Math.round((value / max) * 100);
        return `
          <div class="bar">
            <div class="label">${label}</div>
            <div class="track"><div class="fill" style="width:${w}%"></div></div>
            <div class="muted">${value}</div>
          </div>
        `;
      }).join("");
    };

    const renderClicksPie = (hourCounts) => {
      const canvas = document.getElementById("clicksPie");
      const legend = document.getElementById("clicksLegend");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const total = hourCounts.reduce((a, b) => a + b, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!total) {
        ctx.fillStyle = "rgba(255,255,255,.6)";
        ctx.font = "14px system-ui, Segoe UI, Arial";
        ctx.fillText("Aucun clic", 60, 110);
        if (legend) legend.innerHTML = "";
        return;
      }
      const colors = [
        "#22d3ee","#f59e0b","#60a5fa","#a78bfa","#34d399","#f87171",
        "#fbbf24","#38bdf8","#fb7185","#4ade80","#c084fc","#f97316"
      ];
      let start = -Math.PI / 2;
      const entries = hourCounts
        .map((count, hour) => ({ hour, count }))
        .filter(e => e.count > 0)
        .sort((a,b) => b.count - a.count);
      entries.forEach((e, idx) => {
        const angle = (e.count / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(110, 110);
        ctx.arc(110, 110, 100, start, start + angle);
        ctx.closePath();
        ctx.fillStyle = colors[idx % colors.length];
        ctx.fill();
        start += angle;
      });
      if (legend) {
        legend.innerHTML = entries
          .map((e, idx) => `<li><span style="color:${colors[idx % colors.length]}">●</span> ${String(e.hour).padStart(2,"0")}h — ${e.count}</li>`)
          .join("");
      }
    };

    const renderEventsHourBar = (hourCounts) => {
      const canvas = document.getElementById("eventsHourBar");
      const legend = document.getElementById("eventsHourLegend");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      const padding = { top: 10, right: 10, bottom: 24, left: 28 };
      const chartW = width - padding.left - padding.right;
      const chartH = height - padding.top - padding.bottom;
      const max = Math.max(1, ...hourCounts);
      // Axes
      ctx.strokeStyle = "rgba(255,255,255,.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top);
      ctx.lineTo(padding.left, padding.top + chartH);
      ctx.lineTo(padding.left + chartW, padding.top + chartH);
      ctx.stroke();
      // Y ticks (0, max/2, max)
      ctx.fillStyle = "rgba(255,255,255,.6)";
      ctx.font = "10px system-ui, Segoe UI, Arial";
      const ticks = [0, Math.round(max/2), max];
      ticks.forEach((t) => {
        const y = padding.top + chartH - (t / max) * chartH;
        ctx.fillText(String(t), 4, y + 3);
        ctx.strokeStyle = "rgba(255,255,255,.08)";
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartW, y);
        ctx.stroke();
      });
      // Bars
      const barW = Math.floor(chartW / 24);
      for (let i = 0; i < 24; i += 1) {
        const h = hourCounts[i];
        const barH = Math.round((h / max) * chartH);
        const x = padding.left + i * barW + 1;
        const y = padding.top + chartH - barH;
        ctx.fillStyle = "rgba(34,211,238,.85)";
        ctx.fillRect(x, y, barW - 2, barH);
      }
      // X labels (0,6,12,18,23)
      ctx.fillStyle = "rgba(255,255,255,.6)";
      ctx.font = "10px system-ui, Segoe UI, Arial";
      [0,6,12,18,23].forEach((h) => {
        const x = padding.left + h * barW;
        ctx.fillText(String(h).padStart(2,"0"), x, padding.top + chartH + 16);
      });
      if (legend) {
        const total = hourCounts.reduce((a,b) => a + b, 0);
        const peak = hourCounts.indexOf(Math.max(...hourCounts));
        legend.innerHTML = `
          <li>Total: ${total}</li>
          <li>Pic: ${String(peak).padStart(2, "0")}h</li>
        `;
      }
    };

    const paginate = (rows) => {
      const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;
      const start = (currentPage - 1) * pageSize;
      const pageRows = rows.slice(start, start + pageSize);
      renderRows(pageRows);
      const pageInfo = document.getElementById("pageInfo");
      if (pageInfo) pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;
      const prevBtn = document.getElementById("prevPage");
      const nextBtn = document.getElementById("nextPage");
      if (prevBtn) prevBtn.disabled = currentPage <= 1;
      if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    };

    const setOptions = (selectId, values) => {
      const sel = document.getElementById(selectId);
      if (!sel) return;
      const current = sel.value;
      const opts = values.map((v) => `<option value="${v}">${v}</option>`).join("");
      sel.innerHTML = `<option value="">${selectId === "ipFilter" ? "Toutes" : "Tous"}</option>${opts}`;
      if (values.includes(current)) sel.value = current;
    };

    const getSelectedFile = () => {
      const sel = document.getElementById("logSelect");
      return sel ? sel.value : "";
    };

    const refresh = async () => {
      try {
        const file = getSelectedFile();
        const url = file ? `live.php?json=1&file=${encodeURIComponent(file)}` : "live.php?json=1";
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        const rows = data.rows || [];
        allRows = rows;
        const eventCounts = {};
        const countryCounts = {};
        const ipCounts = {};
        const ips = new Set();
        const countries = new Set();
        const hourCounts = Array.from({ length: 24 }, () => 0);
        const eventHourCounts = Array.from({ length: 24 }, () => 0);
        let consent = 0;
        let clicks = 0;
        rows.forEach((j) => {
          const evt = j.event || "unknown";
          eventCounts[evt] = (eventCounts[evt] || 0) + 1;
          {
            if (Number.isInteger(j.client_hour) && j.client_hour >= 0 && j.client_hour <= 23) {
              eventHourCounts[j.client_hour] += 1;
            } else {
              const base = j.client_ts || j.ts || "";
              const d = new Date(base);
              if (!isNaN(d.getTime())) {
                eventHourCounts[d.getHours()] += 1;
              }
            }
          }
          if (j.ip) {
            ips.add(j.ip);
            ipCounts[j.ip] = (ipCounts[j.ip] || 0) + 1;
          }
          if (j.country) {
            countries.add(j.country);
            countryCounts[j.country] = (countryCounts[j.country] || 0) + 1;
          }
          if (evt === "consent") consent += 1;
          if (evt === "click") {
            clicks += 1;
            if (Number.isInteger(j.client_hour) && j.client_hour >= 0 && j.client_hour <= 23) {
              hourCounts[j.client_hour] += 1;
            } else {
              const base = j.client_ts || j.ts || "";
              const d = new Date(base);
              if (!isNaN(d.getTime())) {
                hourCounts[d.getHours()] += 1;
              }
            }
          }
        });

        document.getElementById("kpiTotal").textContent = rows.length;
        document.getElementById("kpiUsers").textContent = ips.size;
        document.getElementById("kpiConsent").textContent = consent;
        document.getElementById("kpiClicks").textContent = clicks;
        renderBars(eventCounts);
        renderCountryBars(countryCounts);
        renderIpBars(ipCounts);
        renderClicksPie(hourCounts);
        renderEventsHourBar(eventHourCounts);
        setOptions("ipFilter", Array.from(ips).sort());
        setOptions("countryFilter", Array.from(countries).sort());
        const ipSel = document.getElementById("ipFilter")?.value || "";
        const countrySel = document.getElementById("countryFilter")?.value || "";
        const filtered = rows.filter((j) => {
          if (ipSel && j.ip !== ipSel) return false;
          if (countrySel && j.country !== countrySel) return false;
          return true;
        });
        paginate(filtered);
        const now = new Date();
        document.getElementById("lastUpdate").textContent = now.toLocaleTimeString("fr-FR");
      } catch (e) {
        // no-op
      }
    };

    const logSelect = document.getElementById("logSelect");
    if (logSelect) {
      logSelect.addEventListener("change", () => {
        currentPage = 1;
        refresh();
      });
    }
    const ipFilter = document.getElementById("ipFilter");
    if (ipFilter) {
      ipFilter.addEventListener("change", () => {
        currentPage = 1;
        refresh();
      });
    }
    const countryFilter = document.getElementById("countryFilter");
    if (countryFilter) {
      countryFilter.addEventListener("change", () => {
        currentPage = 1;
        refresh();
      });
    }
    const prevPage = document.getElementById("prevPage");
    if (prevPage) {
      prevPage.addEventListener("click", () => {
        currentPage -= 1;
        const ipSel = document.getElementById("ipFilter")?.value || "";
        const countrySel = document.getElementById("countryFilter")?.value || "";
        const filtered = allRows.filter((j) => {
          if (ipSel && j.ip !== ipSel) return false;
          if (countrySel && j.country !== countrySel) return false;
          return true;
        });
        paginate(filtered);
      });
    }
    const nextPage = document.getElementById("nextPage");
    if (nextPage) {
      nextPage.addEventListener("click", () => {
        currentPage += 1;
        const ipSel = document.getElementById("ipFilter")?.value || "";
        const countrySel = document.getElementById("countryFilter")?.value || "";
        const filtered = allRows.filter((j) => {
          if (ipSel && j.ip !== ipSel) return false;
          if (countrySel && j.country !== countrySel) return false;
          return true;
        });
        paginate(filtered);
      });
    }

    refresh();
    setInterval(refresh, 60000);
  </script>
</body>
</html>
