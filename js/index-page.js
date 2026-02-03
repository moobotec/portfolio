    (function () {
      const section = document.getElementById('projects');
      if (!section) return;

      const cards = Array.from(section.querySelectorAll('.glass.p-4'));
      const input = section.querySelector('#projectFilterInput');
      const buttons = Array.from(section.querySelectorAll('[data-filter]'));
      let activeFilter = 'all';

      function normalize(text) {
        return (text || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
      }

      function isPrivate(card) {
        const badges = card.querySelectorAll('.project-badges .badge');
        for (const badge of badges) {
          if (normalize(badge.textContent).trim() === 'prive') {
            return true;
          }
        }
        return false;
      }

      function filterText(card) {
        if (!card.dataset.filterText) {
          const chips = Array.from(card.querySelectorAll('.chip')).map((c) => c.textContent).join(' ');
          const title = card.querySelector('h3')?.textContent ?? '';
          const subtitle = card.querySelector('.text-white-50')?.textContent ?? '';
          const body = card.querySelector('p')?.textContent ?? '';
          card.dataset.filterText = normalize([title, subtitle, body, chips].join(' '));
        }
        return card.dataset.filterText;
      }

      function applyFilter() {
        const query = normalize(input?.value ?? '');
        const tokens = query.split(/[, ]+/).filter(Boolean);

        cards.forEach((card) => {
          const priv = isPrivate(card);
          if (activeFilter === 'private' && !priv) {
            card.parentElement?.classList.add('d-none');
            return;
          }
          if (activeFilter === 'public' && priv) {
            card.parentElement?.classList.add('d-none');
            return;
          }
          if (tokens.length) {
            const hay = filterText(card);
            const ok = tokens.every((t) => hay.includes(t));
            card.parentElement?.classList.toggle('d-none', !ok);
            return;
          }
          card.parentElement?.classList.remove('d-none');
        });
      }

      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          buttons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          activeFilter = btn.getAttribute('data-filter') || 'all';
          applyFilter();
        });
      });

      input?.addEventListener('input', applyFilter);
    })();
