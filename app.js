import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  query,
  orderBy,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAtFPX1nB7dLgbQWAHBnqv3N2-hL5eWHgo",
  authDomain: "gestor-pro-venezuela.firebaseapp.com",
  projectId: "gestor-pro-venezuela",
  storageBucket: "gestor-pro-venezuela.firebasestorage.app",
  messagingSenderId: "767203590243",
  appId: "1:767203590243:web:dffac7819a1101ae733856"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const STORAGE_KEYS = {
  QR_SESSION: "gestor_pro_qr_session_v1",
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
    submitRegister: "Crear cuenta y enviar confirmación",
    submitLogin: "Iniciar sesión",
    resendVerify: "Reenviar correo de confirmación",
    qrDesc: "Escanea o ingresa el código de vinculación generado desde el dispositivo principal para sincronizar tu equipo.",
    connectQr: "Conectar dispositivo",
    modeAccount: "Cuenta verificada",
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
    submitRegister: "Create account & send confirmation",
    submitLogin: "Sign in",
    resendVerify: "Resend verification email",
    qrDesc: "Scan or enter the pairing code generated on the main device to sync your team.",
    connectQr: "Connect device",
    modeAccount: "Verified account",
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
    submitRegister: "Criar conta e enviar confirmação",
    submitLogin: "Entrar",
    resendVerify: "Reenviar e-mail de confirmação",
    qrDesc: "Escaneie ou informe o código de vínculo gerado no aparelho principal para sincronizar sua equipe.",
    connectQr: "Conectar dispositivo",
    modeAccount: "Conta verificada",
    modeQr: "Vinculado por QR"
  }
};

let pendingVerificationUser = null;
let localRecords = [];

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
  setText("btn-resend-verify", t.resendVerify);
  setText("qr-instructions", t.qrDesc);
  setText("btn-connect-qr", t.connectQr);

  const langSel = document.getElementById("lang-select");
  const appLangSel = document.getElementById("app-lang-select");
  if (langSel) langSel.value = safeLang;
  if (appLangSel) appLangSel.value = safeLang;

  updateSessionLabels();
}
window.setLanguage = setLanguage;

function showBanner(msg, isError = false) {
  const banner = document.getElementById("status-banner");
  if (!banner) return;
  banner.textContent = msg;
  banner.classList.toggle("error", isError);
  banner.classList.remove("hidden");
}

function showModalFeedback(msg, isError = false) {
  const box = document.getElementById("modal-feedback");
  if (!box) return;
  box.textContent = msg;
  box.classList.toggle("error", isError);
  box.classList.remove("hidden");
}

function clearModalFeedback() {
  const box = document.getElementById("modal-feedback");
  if (!box) return;
  box.textContent = "";
  box.classList.add("hidden");
  box.classList.remove("error");
}

function openAuthModal(mode) {
  clearModalFeedback();
  const modal = document.getElementById("auth-modal");
  const title = document.getElementById("modal-title");
  const formReg = document.getElementById("form-register");
  const formLog = document.getElementById("form-login");
  const panelQr = document.getElementById("panel-qr");
  const resendBtn = document.getElementById("btn-resend-verify");
  const t = TRANSLATIONS[getCurrentLang()];

  formReg.classList.add("hidden");
  formLog.classList.add("hidden");
  panelQr.classList.add("hidden");
  resendBtn.classList.add("hidden");

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
window.openAuthModal = openAuthModal;

function closeAuthModal() {
  document.getElementById("auth-modal").classList.add("hidden");
  clearModalFeedback();
}
window.closeAuthModal = closeAuthModal;

async function handleRegisterSubmit(event) {
  event.preventDefault();
  clearModalFeedback();

  const businessName = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-pass").value;

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    pendingVerificationUser = cred.user;

    await setDoc(doc(db, "users", cred.user.uid), {
      businessName,
      email: cred.user.email,
      emailVerified: false,
      createdAt: serverTimestamp()
    });

    await signOut(auth);
    closeAuthModal();
    showBanner(`Te enviamos un correo de confirmación a ${email}. Ábrelo y confirma tu cuenta antes de iniciar sesión.`);
  } catch (err) {
    showModalFeedback(err?.message || "No se pudo completar el registro.", true);
  }
}
window.handleRegisterSubmit = handleRegisterSubmit;

async function handleLoginSubmit(event) {
  event.preventDefault();
  clearModalFeedback();
  const resendBtn = document.getElementById("btn-resend-verify");
  resendBtn.classList.add("hidden");

  const email = document.getElementById("log-email").value.trim();
  const password = document.getElementById("log-pass").value;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await cred.user.reload();

    if (!cred.user.emailVerified) {
      pendingVerificationUser = cred.user;
      resendBtn.classList.remove("hidden");
      await signOut(auth);
      showModalFeedback("Tu correo aún no ha sido confirmado. Revisa tu bandeja o reenvía el correo de verificación.", true);
      return;
    }

    await setDoc(
      doc(db, "users", cred.user.uid),
      { emailVerified: true, lastLoginAt: serverTimestamp() },
      { merge: true }
    );

    localStorage.removeItem(STORAGE_KEYS.QR_SESSION);
    closeAuthModal();
    renderViewState();
  } catch (err) {
    showModalFeedback(err?.message || "No se pudo iniciar sesión.", true);
  }
}
window.handleLoginSubmit = handleLoginSubmit;

async function handleResendVerification() {
  if (!pendingVerificationUser) return;
  try {
    await sendEmailVerification(pendingVerificationUser);
    showModalFeedback("Correo de confirmación reenviado. Revisa tu bandeja de entrada o spam.");
  } catch (err) {
    showModalFeedback(err?.message || "No se pudo reenviar el correo.", true);
  }
}
window.handleResendVerification = handleResendVerification;

function handleQrConnect() {
  const code = (document.getElementById("qr-token").value || "").trim() || "GP-2026-SYNC";
  localStorage.setItem(STORAGE_KEYS.QR_SESSION, JSON.stringify({ code, connectedAt: Date.now() }));
  closeAuthModal();
  renderViewState();
}
window.handleQrConnect = handleQrConnect;

function getQrSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.QR_SESSION));
  } catch {
    return null;
  }
}

async function logoutSession() {
  localStorage.removeItem(STORAGE_KEYS.QR_SESSION);
  toggleDrawer(false);
  if (auth.currentUser) {
    await signOut(auth);
  }
  renderViewState();
}
window.logoutSession = logoutSession;

function updateSessionLabels() {
  const t = TRANSLATIONS[getCurrentLang()];
  const userEl = document.getElementById("session-user-label");
  const modeEl = document.getElementById("session-mode-label");
  if (!userEl || !modeEl) return;

  if (auth.currentUser && auth.currentUser.emailVerified) {
    userEl.textContent = auth.currentUser.email || "Usuario";
    modeEl.textContent = t.modeAccount;
    return;
  }

  const qr = getQrSession();
  if (qr) {
    userEl.textContent = `Equipo (${qr.code})`;
    modeEl.textContent = t.modeQr;
  }
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
window.toggleDrawer = toggleDrawer;

function selectSection(sectionName, btnEl) {
  document.getElementById("current-section-title").textContent = sectionName;
  document.getElementById("panel-heading").textContent = sectionName;
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");
  toggleDrawer(false);
}
window.selectSection = selectSection;

function renderRecordsUI() {
  const listEl = document.getElementById("records-list");
  const countEl = document.getElementById("kpi-records");
  const salesEl = document.getElementById("kpi-sales");
  const creditEl = document.getElementById("kpi-credit");

  let salesTotal = 0;
  let creditTotal = 0;

  localRecords.forEach((r) => {
    const amt = Number(r.amount) || 0;
    if (r.type === "venta") salesTotal += amt;
    if (r.type === "fiado") creditTotal += amt;
  });

  if (salesEl) salesEl.textContent = `$${salesTotal.toFixed(2)}`;
  if (creditEl) creditEl.textContent = `$${creditTotal.toFixed(2)}`;
  if (countEl) countEl.textContent = String(localRecords.length);

  if (!listEl) return;
  listEl.innerHTML = "";
  localRecords.forEach((r) => {
    const li = document.createElement("li");
    li.className = "record-item";
    li.innerHTML = `<span><strong>[${r.type}]</strong> ${r.title}</span><strong>$${(Number(r.amount) || 0).toFixed(2)}</strong>`;
    listEl.appendChild(li);
  });
}

async function loadFirestoreRecords(uid) {
  try {
    const q = query(collection(db, "users", uid, "registros"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    localRecords = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderRecordsUI();
  } catch {
    renderRecordsUI();
  }
}

async function handleSaveRecord(event) {
  event.preventDefault();
  const feedback = document.getElementById("records-feedback");
  const type = document.getElementById("rec-type").value;
  const title = document.getElementById("rec-title").value.trim();
  const amount = Number(document.getElementById("rec-amount").value) || 0;

  const entry = { type, title, amount, createdLocal: new Date().toISOString() };

  try {
    if (auth.currentUser && auth.currentUser.emailVerified) {
      await addDoc(collection(db, "users", auth.currentUser.uid, "registros"), {
        ...entry,
        createdAt: serverTimestamp()
      });
      await loadFirestoreRecords(auth.currentUser.uid);
    } else {
      localRecords.unshift(entry);
      renderRecordsUI();
    }

    event.target.reset();
    if (feedback) {
      feedback.textContent = "Registro guardado correctamente.";
      feedback.classList.remove("error", "hidden");
    }
  } catch (err) {
    if (feedback) {
      feedback.textContent = err?.message || "Error al guardar el registro.";
      feedback.classList.add("error");
      feedback.classList.remove("hidden");
    }
  }
}
window.handleSaveRecord = handleSaveRecord;

async function renderViewState() {
  const authScreen = document.getElementById("auth-screen");
  const appShell = document.getElementById("app-shell");
  const verifiedUser = auth.currentUser && auth.currentUser.emailVerified;
  const qrSession = getQrSession();

  toggleDrawer(false);

  if (verifiedUser || qrSession) {
    authScreen.classList.add("hidden");
    appShell.classList.remove("hidden");
    updateSessionLabels();
    if (verifiedUser) {
      await loadFirestoreRecords(auth.currentUser.uid);
    } else {
      renderRecordsUI();
    }
  } else {
    appShell.classList.add("hidden");
    authScreen.classList.remove("hidden");
  }
}

onAuthStateChanged(auth, () => {
  renderViewState();
});

document.addEventListener("DOMContentLoaded", () => {
  setLanguage(getCurrentLang());
  renderViewState();
});
