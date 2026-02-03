// Logo par défaut (SVG minimal en data URI)
  window.DEFAULT_LOGO_DATAURI =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>
        <rect x='1' y='1' width='62' height='62' rx='16' fill='rgba(255,255,255,.06)' stroke='rgba(255,255,255,.18)'/>
        <g fill='rgba(255,255,255,.65)' transform='translate(16,16) scale(1.4)'>
          <path d='M3 21V3h14v18H3Zm2-2h10V5H5v14Zm14 2v-8h2v8h-2Zm-9-2h2v-2H10v2Zm0-4h2v-2H10v2Zm0-4h2V9H10v2ZM7 19h2v-2H7v2Zm0-4h2v-2H7v2Zm0-4h2V9H7v2Z'/>
        </g>
      </svg>
    `);
