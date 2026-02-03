    (function () {
      const container = document.getElementById('runningHeatmap');
      if (!container || typeof CalHeatmap === 'undefined') return;
      const yearSelect = document.getElementById('heatmapYear');

      function localizeHeatmapMonths() {
        const map = {
          Jan: 'Janv',
          Feb: 'Févr',
          Mar: 'Mars',
          Apr: 'Avr',
          May: 'Mai',
          Jun: 'Juin',
          Jul: 'Juil',
          Aug: 'Août',
          Sep: 'Sept',
          Oct: 'Oct',
          Nov: 'Nov',
          Dec: 'Déc'
        };
        const labels = container.querySelectorAll('.ch-domain-text');
        labels.forEach((label) => {
          const key = (label.textContent || '').trim().slice(0, 3);
          if (map[key]) {
            label.textContent = map[key];
          }
        });
      }

      const minYear = 2021;
      const maxYear = new Date().getFullYear();
      let currentYear = new Date().getFullYear();

      const clampYear = (year) => Math.min(maxYear, Math.max(minYear, year));

      function render(year, source) {
        currentYear = clampYear(year);
        if (yearSelect) {
          yearSelect.value = String(currentYear);
        }
        container.innerHTML = '';
        const cal = new CalHeatmap();
        cal.paint({
          itemSelector: '#runningHeatmap',
          range: 12,
          // Force Jan 1st in UTC to avoid Dec/Nov shift from timezone offsets.
          date: { start: new Date(Date.UTC(currentYear, 0, 1)), timezone: 'UTC' },
          domain: { type: 'month', gutter: 6 },
          subDomain: { type: 'ghDay', radius: 2, width: 16, height: 16, gutter: 3 },
          scale: {
            color: {
              type: 'linear',
              scheme: 'Greens',
              domain: [0, 15]
            }
          },
          legend: [1, 3, 6, 9, 12],
          data: {
            source: '/activities.php?metric=distance',
            x: 'date',
            y: 'value',
            groupY: 'sum',
            defaultValue: 0
          }
        });
        setTimeout(localizeHeatmapMonths, 0);
        if (source && source !== 'init') {
          window.dispatchEvent(new CustomEvent('heatmap-year-change', {
            detail: { year: currentYear, source }
          }));
        }
      }

      container.addEventListener('wheel', (event) => {
        if (!event.ctrlKey) {
          return;
        }
        event.preventDefault();
        const direction = event.deltaY > 0 ? 1 : -1;
        render(currentYear + direction, 'wheel');
      }, { passive: false });

      if (yearSelect) {
        for (let y = maxYear; y >= minYear; y -= 1) {
          const opt = document.createElement('option');
          opt.value = String(y);
          opt.textContent = String(y);
          yearSelect.appendChild(opt);
        }
        yearSelect.addEventListener('change', () => {
          const nextYear = Number(yearSelect.value);
          if (!Number.isNaN(nextYear)) {
            render(nextYear, 'select');
          }
        });
      }

      let touchStartX = 0;
      let touchStartY = 0;
      container.addEventListener('touchstart', (event) => {
        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      }, { passive: true });
      container.addEventListener('touchend', (event) => {
        const touch = event.changedTouches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          render(currentYear + (dx < 0 ? 1 : -1), 'swipe');
        }
      }, { passive: true });

      render(currentYear, 'init');
    })();
