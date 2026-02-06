const chatFab = document.getElementById('chatFab');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatClear = document.getElementById('chatClear');
const chatBody = document.getElementById('chatBody');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatLang = document.getElementById('chatLang');
const chatTitle = document.getElementById('chatTitle');
const chatSubtitle = document.getElementById('chatSubtitle');
let chatHint = document.getElementById('chatHint');
let chatWelcome = document.getElementById('chatWelcome');
const chatTip = document.getElementById('chatTip');
let chatCsrfToken = '';

const chatI18n = {
  fr: {
    title: 'Assistant nostalgie',
    subtitle: 'AIML / Rebecca',
    clear: 'Effacer',
    hint: 'Connecté au backend AIML',
    welcome: 'Salut 👋 Je suis ton petit agent “à l’ancienne”. Écris-moi un message !',
    placeholder: 'Écrire un message…',
    send: 'Envoyer',
    tip: 'Astuce : <span class="opacity-75">Entrée</span> pour envoyer, <span class="opacity-75">Échap</span> pour fermer.',
  },
  en: {
    title: 'Nostalgia Assistant',
    subtitle: 'AIML / Rebecca',
    clear: 'Clear',
    hint: 'Connected to AIML backend',
    welcome: 'Hi 👋 I am your old-school little agent. Write me a message!',
    placeholder: 'Type a message…',
    send: 'Send',
    tip: 'Tip: press <span class="opacity-75">Enter</span> to send, <span class="opacity-75">Esc</span> to close.',
  },
};

let currentLang = localStorage.getItem('chatLang') || 'fr';

function applyChatLang(lang) {
  const t = chatI18n[lang] || chatI18n.fr;
  currentLang = lang;
  chatTitle.textContent = t.title;
  chatSubtitle.textContent = t.subtitle;
  chatClear.textContent = t.clear;
  chatInput.placeholder = t.placeholder;
  chatSend.textContent = t.send;
  chatTip.innerHTML = t.tip;
  if (chatHint) chatHint.textContent = t.hint;
  if (chatWelcome) chatWelcome.textContent = t.welcome;
  chatLang.value = lang;
}

function openChat() {
  chatPanel.classList.add('open');
  setTimeout(() => chatInput.focus(), 50);
}

function closeChat() {
  chatPanel.classList.remove('open');
  chatFab.focus();
}

function addMessage(role, text) {
  const wrap = document.createElement('div');
  wrap.className = `msg ${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;

  wrap.appendChild(bubble);
  chatBody.appendChild(wrap);

  // scroll bas
  chatBody.scrollTop = chatBody.scrollHeight;
}

function addPendingMessage() {
  const wrap = document.createElement('div');
  wrap.className = 'msg bot pending';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = `
    <span class="typing-dots" aria-hidden="true">
      <span></span><span></span><span></span>
    </span>
  `;

  wrap.appendChild(bubble);
  chatBody.appendChild(wrap);
  chatBody.scrollTop = chatBody.scrollHeight;
  return { wrap, bubble };
}

function resetChatBody() {
  const t = chatI18n[currentLang] || chatI18n.fr;
  chatBody.innerHTML = `
    <div id="chatHint" class="chat-hint">${t.hint}</div>
    <div class="msg bot"><div id="chatWelcome" class="bubble">${t.welcome}</div></div>
  `;
  chatHint = document.getElementById('chatHint');
  chatWelcome = document.getElementById('chatWelcome');
}

async function ensureCsrfToken() {
  if (chatCsrfToken) return chatCsrfToken;
  try {
    const res = await fetch('chatbot/chat.php?action=token');
    const data = await res.json();
    if (data && data.token) {
      chatCsrfToken = data.token;
      return chatCsrfToken;
    }
  } catch (_) {}
  return '';
}

async function fetchBotReply(userText) {
  let res;
  try {
    if (!chatCsrfToken) {
      await ensureCsrfToken();
    }
    res = await fetch('chatbot/chat.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ message: userText, lang: currentLang, csrf: chatCsrfToken }),
    });
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    throw new Error(`Fetch échoué: ${msg}`);
  }

  const contentType = res.headers.get('Content-Type') || '';
  let payloadText = '';
  try {
    payloadText = await res.text();
  } catch (err) {
    payloadText = '';
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} | ${payloadText.slice(0, 200)}`);
  }

  if (!contentType.includes('application/json')) {
    throw new Error(`Réponse non JSON (${contentType || 'inconnu'}) | ${payloadText.slice(0, 200)}`);
  }

  let data;
  try {
    data = JSON.parse(payloadText);
  } catch (err) {
    throw new Error(`JSON invalide | ${payloadText.slice(0, 200)}`);
  }

  return data.reply || "Erreur serveur (reply manquante).";
}

chatFab.addEventListener('click', () => {
  const isOpen = chatPanel.classList.contains('open');
  isOpen ? closeChat() : openChat();
});

chatClose.addEventListener('click', closeChat);

chatClear.addEventListener('click', () => {
  // Efface tout sauf le hint + message d’accueil
  resetChatBody();
  chatInput.focus();
});

chatLang.addEventListener('change', (e) => {
  const nextLang = e.target.value || 'fr';
  localStorage.setItem('chatLang', nextLang);
  applyChatLang(nextLang);
  resetChatBody();
  ensureCsrfToken().then((token) => fetch('chatbot/chat.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ reset: '1', lang: nextLang, csrf: token }),
  }).catch(() => {}));
});

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const txt = chatInput.value;
  if (!txt.trim()) return;

  addMessage('user', txt);
  chatInput.value = '';

  const pending = addPendingMessage();
  try {
    const reply = await fetchBotReply(txt);
    pending.wrap.classList.remove('pending');
    pending.bubble.textContent = reply;
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    pending.wrap.classList.remove('pending');
    pending.bubble.textContent = "Erreur: " + msg;
  }
});

// Échap pour fermer
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && chatPanel.classList.contains('open')) {
    closeChat();
  }
});

applyChatLang(currentLang);
