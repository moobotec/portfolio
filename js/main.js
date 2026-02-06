  (function () {
    const qs = (selector, root = document) => root.querySelector(selector);
    const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
    const CONSENT_KEY = "analyticsConsent";

    // Nav logo fade-in
    const logo = qs(".nav-logo");
    if (logo) {
      if (logo.complete) {
        logo.classList.add("loaded");
      } else {
        logo.addEventListener("load", () => {
          logo.classList.add("loaded");
        });
      }
    }

    // Smooth anchors (with a single stabilization pass)
    const getNavOffset = () => {
      const nav = qs("#mainNav");
      return nav ? nav.offsetHeight : 0;
    };

    const getTargetTop = (target) =>
      target.getBoundingClientRect().top + window.pageYOffset - getNavOffset() - 10;

    const scrollToTarget = (target, behavior = "smooth") => {
      if (!target) return;
      const top = getTargetTop(target);
      if (behavior === "auto") {
        const html = document.documentElement;
        const body = document.body;
        const prevHtml = html.style.scrollBehavior;
        const prevBody = body.style.scrollBehavior;
        html.style.scrollBehavior = "auto";
        body.style.scrollBehavior = "auto";
        window.scrollTo({ top, behavior: "auto" });
        requestAnimationFrame(() => {
          html.style.scrollBehavior = prevHtml;
          body.style.scrollBehavior = prevBody;
        });
        return;
      }
      window.scrollTo({ top, behavior });
    };

    const stabilizeScroll = (target, opts = {}) => {
      const { timeout = 2500, stableFrames = 4 } = opts;
      let stableCount = 0;
      let lastTop = null;
      const start = performance.now();

      const tick = () => {
        const top = getTargetTop(target);
        if (lastTop !== null && Math.abs(top - lastTop) < 1) {
          stableCount += 1;
        } else {
          stableCount = 0;
        }
        lastTop = top;

        if (stableCount >= stableFrames || performance.now() - start > timeout) {
          scrollToTarget(target, "auto");
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    qsa('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;
        const target = href ? qs(href) : null;
        if (!target) return;
        e.preventDefault();
        const collapseEl = qs("#navCollapse");
        if (collapseEl && collapseEl.classList.contains("show") && window.bootstrap?.Collapse) {
          const collapse = window.bootstrap.Collapse.getOrCreateInstance(collapseEl);
          collapse.hide();
          setTimeout(() => {
            scrollToTarget(target);
            stabilizeScroll(target);
          }, 220);
          return;
        }
        scrollToTarget(target);
        stabilizeScroll(target);
      });
    });

    // Fix hash navigation on initial load (after layout/images)
    const scrollToHashOnLoad = () => {
      const hash = window.location.hash;
      if (!hash || hash.length < 2) return;
      const target = qs(hash);
      if (!target) return;
      setTimeout(() => {
        scrollToTarget(target);
        stabilizeScroll(target);
      }, 80);
    };
    window.addEventListener("load", scrollToHashOnLoad);
    document.addEventListener("DOMContentLoaded", scrollToHashOnLoad);

    // Footer dates
    const yearEl = qs("#year");
    const lastUpdatedEl = qs("#lastUpdated");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    if (lastUpdatedEl) lastUpdatedEl.textContent = "06/02/2026";

    // GDPR consent modal (analytics)
    const consentModalEl = qs("#consentModal");
    if (consentModalEl && window.bootstrap?.Modal) {
      const consentModal = new window.bootstrap.Modal(consentModalEl, { backdrop: "static" });
      const saved = localStorage.getItem(CONSENT_KEY);
      if (!saved) {
        consentModal.show();
      }
      const acceptBtn = qs("#consentAccept");
      const declineBtn = qs("#consentDecline");
      const sendConsent = (decision) => {
        const now = new Date();
        fetch("/track.php", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            event: "consent",
            decision,
            label: decision,
            client_ts: now.toISOString(),
            client_tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
            client_hour: now.getHours(),
            page: location.pathname + location.search + location.hash,
            ref: document.referrer || "",
            lang: navigator.language || "",
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
            ua: navigator.userAgent || "",
            screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`
          }),
          keepalive: true
        }).catch(() => {});
      };
      if (acceptBtn) {
        acceptBtn.addEventListener("click", () => {
          localStorage.setItem(CONSENT_KEY, "granted");
          sendConsent("accepted");
          window.dispatchEvent(new Event("analytics-consent-granted"));
          consentModal.hide();
        });
      }
      if (declineBtn) {
        declineBtn.addEventListener("click", () => {
          localStorage.setItem(CONSENT_KEY, "denied");
          sendConsent("declined");
          consentModal.hide();
        });
      }
    }

    // Auto-play/pause videos in modals (lazy-load src on open)
    const setupModalVideo = (modalId) => {
      const modalEl = qs(modalId);
      if (!modalEl) return;
      const videoEl = modalEl.querySelector("video");
      if (!videoEl) return;
      const sourceEl = videoEl.querySelector("source");
      const dataSrc = sourceEl?.getAttribute("data-src");
      modalEl.addEventListener("shown.bs.modal", () => {
        if (sourceEl && dataSrc && !sourceEl.getAttribute("src")) {
          sourceEl.setAttribute("src", dataSrc);
          videoEl.load();
        }
        videoEl.play().catch(() => {});
      });
      modalEl.addEventListener("hidden.bs.modal", () => {
        videoEl.pause();
        videoEl.currentTime = 0;
        if (sourceEl && sourceEl.getAttribute("src")) {
          sourceEl.removeAttribute("src");
          videoEl.load();
        }
      });
    };
    setupModalVideo("#vStreamingVideoModal");
    setupModalVideo("#robotxVideoModal");

    // Easter egg: key combo sequence (game-style)
    const easterEggSequence = [
      "arrowup","arrowup","arrowdown","arrowdown",
      "arrowleft","arrowright","arrowleft","arrowright",
      "b","a"
    ];
    let easterEggIndex = 0;
    const trackEasterEgg = () => {
      try {
        if (localStorage.getItem("analyticsConsent") !== "granted") return;
        const now = new Date();
        fetch("/track.php", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            event: "easter_egg",
            label: "starter_pack",
            page: location.pathname + location.search,
            client_ts: now.toISOString(),
            client_tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
            client_hour: now.getHours()
          }),
          keepalive: true
        }).catch(() => {});
      } catch (_) {}
    };
    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (key === easterEggSequence[easterEggIndex]) {
        easterEggIndex += 1;
        if (easterEggIndex === easterEggSequence.length) {
          easterEggIndex = 0;
          const modalEl = qs("#starterPackModal");
          if (modalEl && window.bootstrap?.Modal) {
            window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
          }
          trackEasterEgg();
        }
      } else {
        easterEggIndex = 0;
      }
    });

    // Show/hide "to top"
    const toTopBtn = qs("#toTopBtn");
    if (toTopBtn) {
      const onScroll = () => {
        if (window.scrollY > 600) toTopBtn.classList.add("show");
        else toTopBtn.classList.remove("show");
      };
      window.addEventListener("scroll", onScroll);
      onScroll();
      toTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    // Bootstrap form validation + mailto
    function handleSubmit(event) {
      event.preventDefault();

      const form = event.target;
      if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add("was-validated");
        return false;
      }

      const name = form.querySelectorAll("input")[0].value.trim();
      const email = form.querySelector('input[type="email"]').value.trim();
      const subject = form.querySelectorAll("input")[2].value.trim();
      const message = form.querySelector("textarea").value.trim();

      const mailSubject = encodeURIComponent(`Contact - ${subject}`);
      const body = encodeURIComponent(
`Bonjour David,

Nom : ${name}
Email : ${email}

${message}

Bonne journée,`
      );

      window.location.href = `mailto:daumanddavid@hotmail.fr?subject=${mailSubject}&body=${body}`;
      return false;
    }

    // Make function global (used inline in form onsubmit)
    window.handleSubmit = handleSubmit;

    // Theme toggle (day/night)
    const themeToggle = qs("#themeToggle");
    const themeIcon = qs("#themeIcon");
    const themeLabel = qs("#themeLabel");
    if (themeToggle && themeIcon && themeLabel) {
      const applyTheme = (mode) => {
        const isLight = mode === "light";
        document.body.classList.toggle("theme-light", isLight);
        themeIcon.className = isLight ? "bi bi-brightness-high me-1" : "bi bi-moon-stars me-1";
        themeLabel.textContent = isLight ? "Jour" : "Nuit";
        localStorage.setItem("theme", mode);
      };
      const savedTheme = localStorage.getItem("theme");
      applyTheme(savedTheme === "light" ? "light" : "dark");
      themeToggle.addEventListener("click", () => {
        const next = document.body.classList.contains("theme-light") ? "dark" : "light";
        applyTheme(next);
      });
    }

    // Add year labels on the left of each experience item
    qsa("#experience .t-item").forEach((item) => {
      if (item.querySelector(".t-year")) return;
      const meta = item.querySelector(".t-meta");
      if (!meta) return;
      const match = meta.textContent.match(/(19|20)\d{2}/);
      if (!match) return;
      const yearEl = document.createElement("div");
      yearEl.className = "t-year";
      yearEl.textContent = match[0];
      item.insertBefore(yearEl, item.firstChild);
    });

    // Toggle advanced filters
    const toggleFiltersBtn = qs("#toggleFilters");
    const advancedFilters = qs("#advancedFilters");
    const toggleFiltersIcon = qs("#toggleFiltersIcon");
    if (toggleFiltersBtn && advancedFilters) {
      const setFiltersState = (collapsed) => {
        advancedFilters.classList.toggle("is-collapsed", collapsed);
        toggleFiltersBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
        if (toggleFiltersIcon) {
          toggleFiltersIcon.className = collapsed ? "bi bi-chevron-down me-1" : "bi bi-chevron-up me-1";
        }
        toggleFiltersBtn.lastChild.textContent = collapsed ? "Dérouler" : "Masquer";
      };
      setFiltersState(true);
      toggleFiltersBtn.addEventListener("click", () => {
        setFiltersState(!advancedFilters.classList.contains("is-collapsed"));
      });
    }

    // Experience timeline filtering (min/max dates)
    const expMinInput = qs("#expMin");
    const expMaxInput = qs("#expMax");
    const expClearBtn = qs("#expClear");
    const expCount = qs("#expCount");

    let expMinSeconds = null;
    let expMaxSeconds = null;
    const timelineItems = qsa("#experience .timeline .t-item");
    if (timelineItems.length > 0) {
      const now = new Date();
      const nowYear = now.getFullYear();
      const nowMonth = now.getMonth() + 1;
      const activeThemes = new Set();
      const activeClients = new Set();
      const filterButtons = qsa(".filter-chip[data-filter-group]");

      const normalize = (value) =>
        value
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\./g, "")
          .trim();

      const monthFromFr = (token) => {
        const m = normalize(token);
        if (m.startsWith("jan")) return 1;
        if (m.startsWith("fev")) return 2;
        if (m.startsWith("mar")) return 3;
        if (m.startsWith("avr")) return 4;
        if (m.startsWith("mai")) return 5;
        if (m.startsWith("juin")) return 6;
        if (m.startsWith("juil")) return 7;
        if (m.startsWith("aou")) return 8;
        if (m.startsWith("sep")) return 9;
        if (m.startsWith("oct")) return 10;
        if (m.startsWith("nov")) return 11;
        if (m.startsWith("dec")) return 12;
        return null;
      };

      const parseMonthYear = (text) => {
        const parts = text.trim().split(/\s+/);
        if (parts.length < 2) return null;
        const year = parseInt(parts[parts.length - 1], 10);
        const month = monthFromFr(parts[0]);
        if (!year || !month) return null;
        return { year, month };
      };

      const toIndex = (obj) => obj.year * 12 + obj.month;

      const parseRangeFromMeta = (metaText) => {
        if (!metaText) return null;
        const main = metaText.split("•")[0].trim();
        const rangeParts = main.split("→").map((part) => part.trim());
        const start = parseMonthYear(rangeParts[0]);
        if (!start) return null;
        let end = null;
        if (rangeParts[1]) {
          const endNorm = normalize(rangeParts[1]);
          if (endNorm.startsWith("aujourd")) {
            end = { year: nowYear, month: nowMonth };
          } else {
            end = parseMonthYear(rangeParts[1]);
          }
        }
        if (!end) end = start;
        return { start, end };
      };

      let minIndex = Infinity;
      let maxIndex = -Infinity;

      timelineItems.forEach((item) => {
        const meta = item.querySelector(".t-meta");
        const range = parseRangeFromMeta(meta ? meta.textContent : "");
        if (!range) return;
        const startIndex = toIndex(range.start);
        const endIndex = toIndex(range.end);
        item.dataset.startIndex = String(startIndex);
        item.dataset.endIndex = String(endIndex);
        minIndex = Math.min(minIndex, startIndex);
        maxIndex = Math.max(maxIndex, endIndex);
      });

      const indexToValue = (index) => {
        const year = Math.floor(index / 12);
        const month = index % 12;
        const monthValue = String(month || 12).padStart(2, "0");
        const yearValue = month === 0 ? year - 1 : year;
        return `${yearValue}-${monthValue}`;
      };

      if (expMinInput && expMaxInput && Number.isFinite(minIndex) && Number.isFinite(maxIndex)) {
        expMinInput.min = indexToValue(minIndex);
        expMinInput.max = indexToValue(maxIndex);
        expMaxInput.min = indexToValue(minIndex);
        expMaxInput.max = indexToValue(maxIndex);
      }

      const parseInputValue = (value) => {
        if (!value) return null;
        const [yearStr, monthStr] = value.split("-");
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);
        if (!year || !month) return null;
        return year * 12 + month;
      };

      const updateCount = (visible, total) => {
        if (!expCount) return;
        expCount.textContent = `${visible} / ${total} expériences`;
      };

      const getIndexFromSeconds = (seconds) => {
        if (!Number.isFinite(seconds)) return null;
        const date = new Date(seconds * 1000);
        return date.getUTCFullYear() * 12 + (date.getUTCMonth() + 1);
      };

      const getMinIndex = () => {
        let index = null;
        if (expMinInput) {
          const value = parseInputValue(expMinInput.value);
          if (value !== null) index = value;
        }
        if (Number.isFinite(expMinSeconds)) {
          const value = getIndexFromSeconds(expMinSeconds);
          if (value !== null) index = value;
        }
        if (window.codeInputDateB && typeof window.codeInputDateB.getCompleteValue === "function") {
          const value = getIndexFromSeconds(window.codeInputDateB.getCompleteValue());
          if (value !== null) index = value;
        }
        return index;
      };

      const getMaxIndex = () => {
        let index = null;
        if (expMaxInput) {
          const value = parseInputValue(expMaxInput.value);
          if (value !== null) index = value;
        }
        if (Number.isFinite(expMaxSeconds)) {
          const value = getIndexFromSeconds(expMaxSeconds);
          if (value !== null) index = value;
        }
        if (window.codeInputDateC && typeof window.codeInputDateC.getCompleteValue === "function") {
          const value = getIndexFromSeconds(window.codeInputDateC.getCompleteValue());
          if (value !== null) index = value;
        }
        return index;
      };

      const matchesTag = (itemTags, activeSet) => {
        if (activeSet.size === 0) return true;
        if (!itemTags || itemTags.length === 0) return false;
        return itemTags.some((tag) => activeSet.has(tag));
      };

      const parseTags = (value) =>
        (value || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);

      const applyFilter = () => {
        const minValue = getMinIndex();
        const maxValue = getMaxIndex();
        const min = minValue ?? -Infinity;
        const max = maxValue ?? Infinity;
        let visibleCount = 0;

        timelineItems.forEach((item) => {
          const startRaw = item.dataset.startIndex;
          const endRaw = item.dataset.endIndex;
          const startIndex = startRaw ? parseInt(startRaw, 10) : null;
          const endIndex = endRaw ? parseInt(endRaw, 10) : null;
          const dateMatch =
            startIndex === null || endIndex === null ? true : startIndex <= max && endIndex >= min;
          const themes = parseTags(item.dataset.themes);
          const clients = parseTags(item.dataset.client);
          const themeMatch = matchesTag(themes, activeThemes);
          const clientMatch = matchesTag(clients, activeClients);
          const isVisible = dateMatch && themeMatch && clientMatch;
          item.style.display = isVisible ? "" : "none";
          if (isVisible) visibleCount += 1;
        });

        updateCount(visibleCount, timelineItems.length);
      };

      const syncClearButtons = () => {
        filterButtons.forEach((btn) => {
          const group = btn.dataset.filterGroup;
          const isClear = btn.dataset.clearGroup;
          if (!isClear) return;
          if (group === "theme") btn.classList.toggle("active", activeThemes.size === 0);
          if (group === "client") btn.classList.toggle("active", activeClients.size === 0);
        });
      };

      const setActive = (button, isActive) => {
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      };

      filterButtons.forEach((button) => {
        const group = button.dataset.filterGroup;
        const value = button.dataset.filterValue;
        const isClear = button.dataset.clearGroup;
        if (isClear) setActive(button, true);

        button.addEventListener("click", () => {
          if (group === "theme") {
            if (isClear) {
              activeThemes.clear();
              filterButtons
                .filter((btn) => btn.dataset.filterGroup === "theme")
                .forEach((btn) => setActive(btn, btn.dataset.clearGroup === "theme"));
            } else {
              if (activeThemes.has(value)) {
                activeThemes.delete(value);
                setActive(button, false);
              } else {
                activeThemes.add(value);
                setActive(button, true);
                filterButtons
                  .filter((btn) => btn.dataset.clearGroup === "theme")
                  .forEach((btn) => setActive(btn, false));
              }
            }
          }

          if (group === "client") {
            if (isClear) {
              activeClients.clear();
              filterButtons
                .filter((btn) => btn.dataset.filterGroup === "client")
                .forEach((btn) => setActive(btn, btn.dataset.clearGroup === "client"));
            } else {
              if (activeClients.has(value)) {
                activeClients.delete(value);
                setActive(button, false);
              } else {
                activeClients.add(value);
                setActive(button, true);
                filterButtons
                  .filter((btn) => btn.dataset.clearGroup === "client")
                  .forEach((btn) => setActive(btn, false));
              }
            }
          }

          syncClearButtons();
          applyFilter();
        });
      });

      window.applyExperienceFilter = applyFilter;

      if (expMinInput) expMinInput.addEventListener("input", applyFilter);
      if (expMaxInput) expMaxInput.addEventListener("input", applyFilter);
      if (expClearBtn) {
        expClearBtn.addEventListener("click", () => {
          if (expMinInput) expMinInput.value = "";
          if (expMaxInput) expMaxInput.value = "";
          if (window.codeInputDateB && window.codeInputDefaults?.min) {
            window.codeInputDateB.setCompleteValue(window.codeInputDefaults.min, false);
          }
          if (window.codeInputDateC && window.codeInputDefaults?.max) {
            window.codeInputDateC.setCompleteValue(window.codeInputDefaults.max, false);
          }
          expMinSeconds = window.codeInputDateB?.getCompleteValue?.() ?? null;
          expMaxSeconds = window.codeInputDateC?.getCompleteValue?.() ?? null;
          activeThemes.clear();
          activeClients.clear();
          filterButtons
            .filter((btn) => btn.dataset.filterGroup === "theme")
            .forEach((btn) => setActive(btn, btn.dataset.clearGroup === "theme"));
          filterButtons
            .filter((btn) => btn.dataset.filterGroup === "client")
            .forEach((btn) => setActive(btn, btn.dataset.clearGroup === "client"));
          applyFilter();
        });
      }

      syncClearButtons();
      applyFilter();
    }

    // CodeInputBuilder init (min/max dates)
    const codeInputDateMinLimit = new Date(Date.UTC(1998, 4, 1)); // TODO: ajuste ta date min
    const codeInputDateMaxLimit = new Date();
    const codeInputDateMinLimitSec = codeInputDateMinLimit.getTime() / 1000;
    const codeInputDateMaxLimitSec = codeInputDateMaxLimit.getTime() / 1000;

    const codeInputMinDefault = "05/1998";
    const codeInputMaxDefault = new Date();
    window.codeInputDefaults = { min: codeInputMinDefault, max: codeInputMaxDefault };

    const codeInputDateB = $("#codeInputMin").codeInputBuilder({
      type: "date",
      formatDate: "MH/YYYY",
      defaultValue: codeInputMinDefault,
      defaultLanguage: "fr-FR",
      gap: "8px", // Espace entre les inputs
      onValueChange: function ($input, newValue) {
        const completeDate = codeInputDateB.getCompleteValue();
        if (completeDate < codeInputDateMinLimitSec) {
          codeInputDateB.setCompleteValue(codeInputDateMinLimitSec, true);
          return;
        }
        if (completeDate > codeInputDateMaxLimitSec) {
          codeInputDateB.setCompleteValue(codeInputDateMaxLimitSec, true);
          return;
        }
        expMinSeconds = newValue;
        window.applyExperienceFilter && window.applyExperienceFilter();
      }
    });
    window.codeInputDateB = codeInputDateB;
    expMinSeconds = codeInputDateB.getCompleteValue();
    window.applyExperienceFilter && window.applyExperienceFilter();

    const codeInputDateC = $("#codeInputMax").codeInputBuilder({
      type: "date",
      formatDate: "MH/YYYY",
      defaultValue: codeInputMaxDefault,
      defaultLanguage: "fr-FR",
      gap: "8px", // Espace entre les inputs
      onValueChange: function ($input, newValue) {
        const completeDate = codeInputDateC.getCompleteValue();
        if (completeDate < codeInputDateMinLimitSec) {
          codeInputDateC.setCompleteValue(codeInputDateMinLimitSec, true);
          return;
        }
        if (completeDate > codeInputDateMaxLimitSec) {
          codeInputDateC.setCompleteValue(codeInputDateMaxLimitSec, true);
          return;
        }
        expMaxSeconds = newValue;
        window.applyExperienceFilter && window.applyExperienceFilter();
      }
    });
    window.codeInputDateC = codeInputDateC;
    expMaxSeconds = codeInputDateC.getCompleteValue();
    window.applyExperienceFilter && window.applyExperienceFilter();
  })();
