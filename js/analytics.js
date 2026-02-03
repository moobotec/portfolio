(function () {
  const CONSENT_KEY = "analyticsConsent";
  const ENDPOINT = "/track.php";

  function hasConsent() {
    return localStorage.getItem(CONSENT_KEY) === "granted";
  }

  function initAnalytics() {
    if (initAnalytics.started) return;
    initAnalytics.started = true;

    function send(event, data) {
      const now = new Date();
      fetch(ENDPOINT, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          event,
          client_ts: now.toISOString(),
          client_tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
          client_hour: now.getHours(),
          ...data
        }),
        keepalive: true
      }).catch(()=>{});
    }

    function getSource() {
      const ref = document.referrer || "";
      if (!ref) return { source: "direct", ref: "" };

      let host = "";
      try { host = new URL(ref).host.toLowerCase(); } catch(e) { return { source:"other", ref }; }

      if (host.includes("google.")) return { source:"google", ref };
      if (host.includes("bing.")) return { source:"bing", ref };
      if (host.includes("duckduckgo.")) return { source:"duckduckgo", ref };
      if (host.includes("linkedin.com")) return { source:"linkedin", ref };
      if (host.includes("github.com")) return { source:"github", ref };
      if (host.includes("x.com") || host.includes("twitter.com")) return { source:"x", ref };
      if (host.includes("facebook.com")) return { source:"facebook", ref };
      if (host.includes("instagram.com")) return { source:"instagram", ref };

      return { source:"other", ref };
    }

    const s = getSource();

    send("pageview", {
      page: location.pathname + location.search + location.hash,
      ref: s.ref,
      source: s.source
    });

    // 2) Clics (tous éléments data-track + filtres)
    document.addEventListener("click", function (e) {
      const trackEl = e.target.closest("[data-track]");
      if (trackEl) {
        const link = trackEl.closest("a");
        const href = link ? (link.href || link.getAttribute("href") || "") : "";
        const label =
          trackEl.getAttribute("data-track") ||
          (trackEl.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80) ||
          href;

        // si tu veux UNIQUEMENT les liens externes, décommente ce bloc :
        // try { if (href && new URL(href).host === location.host) return; } catch(e) {}

        send("click", {
          page: location.pathname + location.search,
          href,
          label
        });
        return;
      }

      const projectFilter = e.target.closest("[data-filter]");
      if (projectFilter) {
        send("filter_projects", {
          page: location.pathname + location.search,
          section: "projects",
          label: projectFilter.getAttribute("data-filter") || ""
        });
        return;
      }

      const expFilter = e.target.closest(".filter-chip[data-filter-group]");
      if (expFilter) {
        const group = expFilter.getAttribute("data-filter-group") || "";
        const value =
          expFilter.getAttribute("data-filter-value") ||
          expFilter.getAttribute("data-clear-group") ||
          "";
        send("filter_experience", {
          page: location.pathname + location.search,
          section: "experience",
          label: `${group}:${value}`
        });
      }
    }, { capture: true });

    // 2b) Inputs / submits
    const projectFilterInput = document.getElementById("projectFilterInput");
    if (projectFilterInput) {
      let lastValue = "";
      projectFilterInput.addEventListener("input", () => {
        const value = (projectFilterInput.value || "").trim();
        if (value === lastValue) return;
        lastValue = value;
        send("filter_projects_text", {
          page: location.pathname + location.search,
          section: "projects",
          label: value.slice(0, 80) || "clear"
        });
      });
    }

    const expMin = document.getElementById("expMin");
    const expMax = document.getElementById("expMax");
    if (expMin) {
      expMin.addEventListener("change", () => {
        send("filter_experience_date", {
          page: location.pathname + location.search,
          section: "experience",
          label: `min:${(expMin.value || "").trim()}`
        });
      });
    }
    if (expMax) {
      expMax.addEventListener("change", () => {
        send("filter_experience_date", {
          page: location.pathname + location.search,
          section: "experience",
          label: `max:${(expMax.value || "").trim()}`
        });
      });
    }

    document.addEventListener("submit", (e) => {
      const form = e.target.closest("form");
      if (!form) return;
      const label =
        form.getAttribute("data-track") ||
        form.getAttribute("id") ||
        "form-submit";
      send("submit", {
        page: location.pathname + location.search,
        section: form.closest("section")?.id || "",
        label
      });
    }, true);

    // Heatmap year change (wheel / swipe / select)
    window.addEventListener("heatmap-year-change", (e) => {
      const detail = e?.detail || {};
      if (!detail.year || detail.source === "init") return;
      send("heatmap_year", {
        page: location.pathname + location.search,
        section: "sport",
        label: String(detail.year),
        source: detail.source || ""
      });
    });

    // 3) Sections vues (IntersectionObserver)
    const seen = new Set();
    const sections = document.querySelectorAll("section[id]");

    if ("IntersectionObserver" in window && sections.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(ent => {
          if (!ent.isIntersecting) return;
          const id = ent.target.id;
          if (!id || seen.has(id)) return;
          seen.add(id);

          send("view_section", {
            page: location.pathname + location.search,
            section: id
          });
        });
      }, { threshold: 0.45 });

      sections.forEach(s => io.observe(s));
    }
  }

  if (hasConsent()) {
    initAnalytics();
  } else {
    window.addEventListener("analytics-consent-granted", initAnalytics, { once: true });
  }
})();
