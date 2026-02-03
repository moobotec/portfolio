(function () {
  const root = document.getElementById("carbon");
  if (!root) return;

  const fmt = (value, digits = 2) => {
    if (!isFinite(value)) return "—";
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(value);
  };

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  const setBar = (id, percent) => {
    const el = document.getElementById(id);
    if (el) el.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  };

  const parseNum = (value) => {
    if (typeof value === "string") {
      const v = value.replace(",", ".");
      return parseFloat(v || "0") || 0;
    }
    return Number(value) || 0;
  };

  const updateSimulator = (factors, pageviewsDefault) => {
    const inputViews = document.getElementById("carbonSimPageviews");
    const inputWeight = document.getElementById("carbonSimWeight");
    if (!inputViews || !inputWeight) return;

    if (pageviewsDefault !== null) {
      inputViews.value = String(Math.max(0, Math.round(pageviewsDefault)));
    }
    if (factors?.avg_page_mb) {
      inputWeight.value = String(factors.avg_page_mb);
    }

    const compute = () => {
      const views = parseNum(inputViews.value);
      const weight = parseNum(inputWeight.value);
      const kgPerGb = parseNum(factors?.factor_kg_per_gb || 0);
      const hostingKg = parseNum(factors?.hosting_kg_year || 0);

      const annualMb = views * weight * 12;
      const annualGb = annualMb / 1024;
      const trafficKg = annualGb * kgPerGb;
      const totalKg = trafficKg + hostingKg;

      setText("carbonSimTraffic", `${fmt(trafficKg, 2)} kg`);
      setText("carbonSimTotal", `${fmt(totalKg, 2)} kg`);
    };

    inputViews.addEventListener("input", compute);
    inputWeight.addEventListener("input", compute);
    compute();
  };

  fetch("/api/carbon.php", { cache: "no-store" })
    .then((res) => res.json())
    .then((data) => {
      const kpis = data?.kpis || {};
      const traffic = data?.traffic || {};
      const factors = data?.factors || {};
      const mobility = data?.mobility || {};
      const ai = data?.ai || {};

      const impact = parseNum(kpis.impact_kg);
      const avoided = parseNum(kpis.avoid_kg);
      const net = parseNum(kpis.net_kg);

      setText("carbonImpact", `${fmt(impact, 2)} kg`);
      setText("carbonAvoided", `${fmt(avoided, 2)} kg`);
      setText("carbonNet", `${fmt(net, 2)} kg`);
      setText("carbonAiImpact", `${fmt(parseNum(ai.kg), 4)} kg`);
      setText("carbonAiImpactDetail", `${fmt(parseNum(ai.kg), 4)} kg`);

      if (net <= 0) {
        setText("carbonNetStatus", "Objectif atteint");
      } else {
        setText("carbonNetStatus", `Reste à compenser : ${fmt(net, 2)} kg`);
      }

      const max = Math.max(impact, avoided, Math.abs(net), 1);
      setBar("carbonBarImpact", (impact / max) * 100);
      setBar("carbonBarAvoided", (avoided / max) * 100);
      setBar("carbonBarNet", (Math.abs(net) / max) * 100);
      setText("carbonBarImpactValue", `${fmt(impact, 1)} kg`);
      setText("carbonBarAvoidedValue", `${fmt(avoided, 1)} kg`);
      setText("carbonBarNetValue", `${fmt(net, 1)} kg`);

      const annualGb = parseNum(traffic.annual_gb);
      setText("carbonTraffic", fmt(annualGb, 2));

      const sourceMap = {
        tracking: "tracking",
        manual: "manuel",
        manual_fallback: "fallback manuel"
      };
      setText("carbonTrafficSource", sourceMap[traffic.source] || "source inconnue");

      setText("carbonHosting", fmt(parseNum(factors.hosting_kg_year), 2));
      const avoidedDetail = (parseNum(mobility.km_bike_year) + parseNum(mobility.km_walk_year)) * parseNum(factors.factor_car_kg_km);
      setText("carbonAvoidedDetail", fmt(avoidedDetail, 2));

      setText("carbonFactorsDate", data?.factors_date || "—");
      setText("carbonFactorsSource", data?.factors_source || "—");
      setText("carbonUpdatedAt", data?.updated_at || "—");

      updateSimulator(factors, traffic.pageviews_month ?? null);
    })
    .catch(() => {
      setText("carbonImpact", "Indisponible");
      setText("carbonAvoided", "Indisponible");
      setText("carbonNet", "Indisponible");
    });
})();
