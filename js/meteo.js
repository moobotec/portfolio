    (function () {
      const modal = document.getElementById('meteoModal');
      if (!modal) return;
      const widget = modal.querySelector('.ow-widget');
      const errorBox = modal.querySelector('.meteo-error');
      const loadingBox = modal.querySelector('.meteo-loading');

      function setText(selector, value) {
        const el = modal.querySelector(selector);
        if (el) {
          el.innerHTML = value ?? '';
        }
      }

      function setIcon(selector, icon) {
        const el = modal.querySelector(selector);
        if (el) {
          el.innerHTML = icon ? "<span class='iconify' data-icon='" + icon + "'></span>" : '';
        }
      }

      function showError(message) {
        if (loadingBox) {
          loadingBox.classList.add('d-none');
        }
        if (errorBox) {
          errorBox.textContent = message || 'Météo indisponible';
          errorBox.classList.remove('d-none');
        }
        if (widget) {
          widget.classList.add('d-none');
        }
      }

      function showLoading() {
        if (loadingBox) {
          loadingBox.classList.remove('d-none');
        }
        if (errorBox) {
          errorBox.classList.add('d-none');
        }
        if (widget) {
          widget.classList.add('d-none');
        }
      }

      function showWidget() {
        if (loadingBox) {
          loadingBox.classList.add('d-none');
        }
        if (errorBox) {
          errorBox.classList.add('d-none');
        }
        if (widget) {
          widget.classList.remove('d-none');
        }
      }

      async function loadMeteo() {
        const city = 'Limoges ,FR';
        const res = await fetch('meteo.php?city=' + encodeURIComponent(city), { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Erreur météo');
        }
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }

        showWidget();
        setText('.ow-city-name', data.city || city);
        setText('.ow-temp-current', (data.temp_current ?? '') + '&deg');
        setText('.ow-pressure', (data.pressure ?? '') + ' hPa');
        setText('.ow-humidity', (data.humidity ?? '') + '%');
        setText('.ow-wind', (data.wind ?? '') + ' km/h');
        setIcon('.ow-ico-current', data.icon);

        const items = modal.querySelectorAll('.ow-forecast-item');
        items.forEach((item, index) => {
          const f = (data.forecast || [])[index];
          if (!f) return;
          const day = item.querySelector('.ow-day');
          const max = item.querySelector('.max');
          const min = item.querySelector('.min');
          const ico = item.querySelector('.ow-ico-forecast');
          if (day) day.textContent = f.dow ?? '';
          if (max) max.innerHTML = (f.temp_max ?? '') + '&deg';
          if (min) min.innerHTML = (f.temp_min ?? '') + '&deg';
          if (ico) ico.innerHTML = f.icon ? "<span class='iconify' data-icon='" + f.icon + "'></span>" : '';
        });
      }

      modal.addEventListener('show.bs.modal', () => {
        showLoading();
        loadMeteo().catch(() => {
          showError('Météo indisponible');
        });
      });
    })();
