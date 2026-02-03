# portfolio

Site portfolio statique. Version en ligne: https://daumand.timecaps.fr/

## Apercu
- Page unique avec navigation ancree et sections regroupees (menus deroulants) + liens directs Conformite IA, Sport et Contact.
- Theme jour/nuit, bouton retour en haut, formulaire de contact qui genere un email (mailto).
- Grille de competences, carrousel de logos, cartes projets.
- Parcours pro avec timeline, dates a gauche et separateur horizontal par experience.
- Filtres avances (periode + themes + type de client) avec bouton Masquer/Derouler.
- Section Sport enrichie avec heatmap d'activite running (Cal-Heatmap) et navigation par annee.
- Ajout d'une tuile randonnee (GR92) avec image du parcours.

## Filtres du parcours
- Date min/max via CodeInputBuilder (format `MH/YYYY`).
- Filtres "Themes" et "Type de client" combinables.
- Bouton "Reinitialiser" qui remet dates et filtres.

## Ajustements mobiles
- Timeline: masquage de l'annee a gauche et de la ligne verticale sous 768px.
- Filtres de date: masquage de la zone Date min/max sous 768px.
- Interludes (ref film): retour a la ligne propre et centrage sur mobile.
- Heatmap running: zone scrollable horizontalement si necessaire.

## Analytics / RGPD
- Consentement via modal (stocke en localStorage) avant activation du tracking.
- Tracking des pages, clics, sections et interactions UI (fichier `js/analytics.js`).
- Elements etiquetes avec `data-track` (liens et boutons).
- Tracking des filtres (projects/experience), formulaire, heatmap (select/molette/swipe).
- Evenements incluent l'heure client (pour stats par heure).
- Logs journaliers (un fichier par jour dans `logs/`).

## Securite / SEO
- `robots.txt` bloque l'indexation de `/admin/` et `/logs/`.
- Protection HTTP Basic sur `admin/live.php` (fichiers `admin/.htaccess` + `admin/.htpasswd`).
- Blocage d'acces direct a `README.md` via `.htaccess` a la racine.
- Dossier `logs/` bloque (fichier `logs/.htaccess`).
- Dossier `cache/` ignore sauf `cache/.htaccess` versionne.
- Dashboard admin avec filtres (IP/pays), pagination et graphiques (events/pays/IP/heure).

## Organisation JS
- Scripts externalises: `js/analytics.js`, `js/main.js`, `js/default-logo.js`, `js/index-page.js`, `js/heatmap.js`, `js/meteo.js`.
- Meteo: chargement asynchrone avec etat "loading" avant affichage (fetch `meteo.php`).
- Heatmap running: Cal-Heatmap + D3 via CDN, donnees via `activities.php?metric=distance`, navigation par select d'annee + molette/swap.

## Stack
- HTML + CSS (inline) + JS vanilla
- Bootstrap 5.3 (layout, utilitaires, composants)
- Bootstrap Icons + Devicon
- CodeInputBuilder (js/codeinputbuilder.js + css)
- Cal-Heatmap + D3 (CDN)

## Lancer en local
- Ouvrir `index.html` dans un navigateur.
- Les assets sont dans `assets/`.
- Si un navigateur bloque la lecture de `/api/activity.json`, utiliser un petit serveur local.

