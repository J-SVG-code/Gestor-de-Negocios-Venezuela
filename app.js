const STORAGE_KEYS = {
  SESSION: "gestor_pro_session_v1",
  LANG: "gestor_pro_lang_v1"
};

const TRANSLATIONS = {
  es: {
    subtitle: "Administra inventario, ventas, fiados, caja multimoneda y sincronización de tu negocio desde cualquier lugar.",
    register: "Crear cuenta / Registrarse",
    login: "Ya tengo una cuenta",
    qr: "Conectar mediante código QR",
    copyright: "© Joelvy José Salazar Vargas",
    version: "Gestor Pro • Multinegocio & Multimoneda",
    modalRegisterTitle: "Crear cuenta / Registrarse",
    modalLoginTitle: "Ya tengo una cuenta",
    modalQrTitle: "Conectar mediante código QR",
    lblName: "Nombre completo o del negocio",
    lblEmail: "Correo electrónico",
    lblPass: "Contraseña",
    submitRegister: "Crear cuenta",
    submitLogin: "Iniciar sesión",
    qrDesc: "Escanea o ingresa el código de vinculación generado desde el dispositivo principal para sincronizar tu equipo.",
    connectQr: "Conectar dispositivo",
    modeAccount: "Cuenta activa",
    modeQr: "Vinculado por QR"
  },
  en: {
    subtitle: "Manage inventory, sales, credit tabs, multi-currency cash register, and team sync from anywhere.",
    register: "Create account / Sign up",
    login: "I already have an account",
    qr: "Connect via QR code",
    copyright: "© Joelvy José Salazar Vargas",
    version: "Gestor Pro • Multi-business & Multi-currency",
    modalRegisterTitle: "Create account / Sign up",
    modalLoginTitle: "I already have an account",
    modalQrTitle: "Connect via QR code",
    lblName: "Full name or business name",
    lblEmail: "Email address",
    lblPass: "Password",
    submitRegister: "Create account",
    submitLogin: "Sign in",
    qrDesc: "Scan or enter the pairing code generated on the main device to sync your team.",
    connectQr: "Connect device",
    modeAccount: "Active account",
    modeQr: "Connected via QR"
  },
  pt: {
    subtitle: "Gerencie estoque, vendas, fiado, caixa multimoeda e sincronização da equipe de qualquer lugar.",
    register: "Criar conta / Cadastrar-se",
    login: "Já tenho uma conta",
    qr: "Conectar via código QR",
    copyright: "© Joelvy José Salazar Vargas",
    version: "Gestor Pro • Multinegócio & Multimoeda",
    modalRegisterTitle: "Criar conta / Cadastrar-se",
    modalLoginTitle: "Já tenho uma conta",
    modalQrTitle: "Conectar via código QR",
    lblName: "Nome completo ou do negócio",
    lblEmail: "E-mail",
    lblPass: "Senha",
    submitRegister: "Criar conta",
    submitLogin: "Entrar",
    qrDesc: "Escaneie ou informe o código de vínculo gerado no aparelho principal para sincronizar sua equipe.",
    connectQr: "Conectar dispositivo",
    modeAccount: "Conta ativa",
    modeQr: "Vinculado por QR"
  }
};

function getCurrentLang() {
  return localStorage.getItem(STORAGE_KEYS.LANG) || "es";
}

function setLanguage(lang) {
  const safeLang = TRANSLATIONS[lang] ? lang : "es";
  localStorage.setItem(STORAGE_KEYS.LANG, safeLang);
  document.documentElement.lang = safeLang;

  const t = TRANSLATIONS[safeLang];
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText("auth-subtitle", t.subtitle);
  setText("txt-register", t.register);
  setText("txt-login", t.login);
  setText("txt-qr", t.qr);
  setText("txt-copyright", t.copyright);
  setText("txt-version", t.version);
  setText("lbl-reg-name", t.lblName);
  setText("lbl-reg-email", t.lblEmail);
  setText("lbl-reg-pass", t.lblPass);
  setText("btn-submit-register", t.submitRegister);
  setText("lbl-log-email", t.lblEmail);
  setText("lbl-log-pass", t.lblPass);
  setText("btn-submit-login", t.submitLogin);
  setText("qr-instructions", t.qrDesc);
  setText("btn-connect-qr", t.connectQr);

  const langSel = document.getElementById("lang-select");
  const appLangSel = document.getElementById("app-lang-select");
  if (langSel) langSel.value = safeLang;
  if (appLangSel) appLangSel.value = safeLang;

  updateSessionLabels();
}

function openAuthModal(mode) {
  const modal = document.getElementById("auth-modal");
  const title = document.getElementById("modal-title");
  const formReg = document.getElementById("form-register");
  const formLog = document.getElementById("form-login");
  const panelQr = document.getElementById("panel-qr");
  const t = TRANSLATIONS[getCurrentLang()];

  formReg.classList.add("hidden");
  formLog.classList.add("hidden");
  panelQr.classList.add("hidden");

  if (mode === "register") {
    title.textContent = t.modalRegisterTitle;
    formReg.classList.remove("hidden");
  } else if (mode === "login") {
    title.textContent = t.modalLoginTitle;
    formLog.classList.remove("hidden");
  } else if (mode === "qr") {
    title.textContent = t.modalQrTitle;
    panelQr.classList.remove("hidden");
  }

  modal.classList.remove("hidden");
}

function closeAuthModal() {
  document.getElementById("auth-modal").classList.add("hidden");
}

function handleRegisterSubmit(event) {
  event.preventDefault();
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  saveSession({ user: name || email, method: "account" });
  closeAuthModal();
  renderViewState();
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const email = document.getElementById("log-email").value.trim();
  saveSession({ user: email, method: "account" });
  closeAuthModal();
  renderViewState();
}

function handleQrConnect() {
  const code = document.getElementById("qr-token").value.trim() || "GP-2026-SYNC";
  saveSession({ user: `Equipo (${code})`, method: "qr" });
  closeAuthModal();
  renderViewState();
}

function saveSession(sessionData) {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION));
  } catch {
    return null;
  }
}

function logoutSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  toggleDrawer(false);
  renderViewState();
}

function updateSessionLabels() {
  const session = getSession();
  const t = TRANSLATIONS[getCurrentLang()];
  const userEl = document.getElementById("session-user-label");
  const modeEl = document.getElementById("session-mode-label");
  if (!session || !userEl || !modeEl) return;

  userEl.textContent = session.user || "Usuario";
  modeEl.textContent = session.method === "qr" ? t.modeQr : t.modeAccount;
}

function toggleDrawer(open) {
  const drawer = document.getElementById("side-drawer");
  const backdrop = document.getElementById("drawer-backdrop");
  if (!drawer || !backdrop) return;

  if (open) {
    drawer.classList.remove("closed");
    drawer.classList.add("open");
    backdrop.classList.remove("hidden");
  } else {
    drawer.classList.remove("open");
    drawer.classList.add("closed");
    backdrop.classList.add("hidden");
  }
}

function selectSection(sectionName, btnEl) {
  document.getElementById("current-section-title").textContent = sectionName;
  document.getElementById("panel-heading").textContent = sectionName;

  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");

  toggleDrawer(false);
}

function renderViewState() {
  const authScreen = document.getElementById("auth-screen");
  const appShell = document.getElementById("app-shell");
  const session = getSession();

  toggleDrawer(false);

  if (session) {
    authScreen.classList.add("hidden");
    appShell.classList.remove("hidden");
    updateSessionLabels();
  } else {
    appShell.classList.add("hidden");
    authScreen.classList.remove("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setLanguage(getCurrentLang());
  renderViewState();
});
