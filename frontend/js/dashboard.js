let pendingGame = null;
let currentTab = 'login';

document.addEventListener('DOMContentLoaded', () => {
  setupParticles();
  renderAuthState();
  setupHeaderButtons();
  setupModal();
  setupForms();
  setupLogout();
});

function isAuthenticated() {
  return !!(localStorage.getItem('token') && localStorage.getItem('user'));
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return null;
  }
}

function renderAuthState() {
  const loggedIn = isAuthenticated();

  document.getElementById('headerGuest').classList.toggle('hidden', loggedIn);
  document.getElementById('headerUser').classList.toggle('hidden', !loggedIn);
  document.getElementById('mobileGuest').classList.toggle('hidden', loggedIn);
  document.getElementById('mobileUser').classList.toggle('hidden', !loggedIn);

  if (loggedIn) {
    const user = getUser();
    const username = (user && user.username) || 'Foydalanuvchi';
    const balance = (user && user.balance) || 0;
    const initial = username.charAt(0).toUpperCase();

    document.getElementById('userName').textContent = username;
    document.getElementById('userAvatar').textContent = initial;
    document.getElementById('userBalance').textContent = balance.toLocaleString();
    document.getElementById('mobileAvatar').textContent = initial;
    document.getElementById('mobileUserName').textContent = username;

    document.getElementById('statBalance').textContent = balance.toLocaleString();
    document.getElementById('welcomeTitle').innerHTML =
      `Xush kelibsiz, <span class="welcome-username">${username}</span>!`;
    document.getElementById('welcomeSubtitle').textContent =
      'Bugun qaysi o\'yinni o\'ynashni xohlaysiz?';
  } else {
    document.getElementById('statBalance').textContent = '—';
    document.getElementById('welcomeTitle').textContent =
      'O\'yinlar olamiga xush kelibsiz!';
    document.getElementById('welcomeSubtitle').textContent =
      'O\'z sevimli o\'yiningizni tanlang va o\'ynashni boshlang';
  }
}

function setupHeaderButtons() {
  const openModalFor = (tab) => {
    switchTab(tab);
    openModal();
  };

  document.getElementById('guestLoginBtn').addEventListener('click', () => openModalFor('login'));
  document.getElementById('guestRegisterBtn').addEventListener('click', () => openModalFor('register'));
  document.getElementById('mobileGuestLogin').addEventListener('click', () => openModalFor('login'));
  document.getElementById('mobileGuestRegister').addEventListener('click', () => openModalFor('register'));
}

/* ============ MODAL LOGIC ============ */

function openModal() {
  const modal = document.getElementById('authModal');
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('authModal');
  modal.classList.remove('show');
  document.body.style.overflow = '';
}

function switchTab(tab) {
  currentTab = tab;

  document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('modalLoginForm').classList.toggle('active', tab === 'login');
  document.getElementById('modalRegisterForm').classList.toggle('active', tab === 'register');
}

function setupModal() {
  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  document.getElementById('tabLogin').addEventListener('click', () => switchTab('login'));
  document.getElementById('tabRegister').addEventListener('click', () => switchTab('register'));

  document.getElementById('authModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('authModal')) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('authModal').classList.contains('show')) {
      closeModal();
    }
  });
}

/* ============ FORM HELPERS ============ */

function clearFieldError(form, input) {
  input.classList.remove('error');
  input.classList.remove('success');
  const errorEl = input.closest('.form-group').querySelector('.error-message');
  if (errorEl) {
    errorEl.classList.remove('visible');
    errorEl.textContent = '';
  }
}

function setFieldError(form, input, message) {
  input.classList.add('error');
  input.classList.remove('success');
  const errorEl = input.closest('.form-group').querySelector('.error-message');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
}

function setFieldSuccess(input) {
  input.classList.remove('error');
  input.classList.add('success');
}

function bindInputClearing(input) {
  input.addEventListener('input', () => clearFieldError(null, input));
  input.addEventListener('focus', () => clearFieldError(null, input));
}

/* ============ FORMS LOGIC ============ */

function setupForms() {
  setupTogglePasswords();

  const regUsername = document.getElementById('modalRegUsername');
  const regEmail = document.getElementById('modalRegEmail');
  const regPass = document.getElementById('modalRegPassword');
  const regConfirm = document.getElementById('modalRegConfirm');

  [regUsername, regEmail, regPass, regConfirm].forEach(bindInputClearing);

  regPass.addEventListener('input', () => updatePasswordStrength(regPass.value));
  regConfirm.addEventListener('input', () => {
    if (regConfirm.value && regConfirm.value !== regPass.value) {
      setFieldError(null, regConfirm, 'Parollar mos kelmaydi');
    } else if (regConfirm.value && regConfirm.value === regPass.value) {
      setFieldSuccess(regConfirm);
    }
  });

  document.getElementById('modalRegisterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleRegister();
  });

  document.getElementById('modalLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleLogin();
  });
}

function setupTogglePasswords() {
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('.form-input');
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.textContent = isPassword ? '◉' : '◎';
    });
  });
}

async function handleRegister() {
  const username = document.getElementById('modalRegUsername');
  const email = document.getElementById('modalRegEmail');
  const password = document.getElementById('modalRegPassword');
  const confirm = document.getElementById('modalRegConfirm');
  const submitBtn = document.getElementById('modalRegisterBtn');

  let isValid = true;

  const usernameValue = username.value.trim();
  const emailValue = email.value.trim();
  const passwordValue = password.value;
  const confirmValue = confirm.value;

  if (!usernameValue) {
    setFieldError(null, username, 'Username kiritish shart');
    isValid = false;
  } else if (usernameValue.length < 3) {
    setFieldError(null, username, 'Username kamida 3 ta belgi bo\'lishi kerak');
    isValid = false;
  } else if (!/^[a-zA-Z0-9_]+$/.test(usernameValue)) {
    setFieldError(null, username, 'Username faqat harflar, raqamlar va _ dan iborat bo\'lishi kerak');
    isValid = false;
  }

  if (!emailValue) {
    setFieldError(null, email, 'Email kiritish shart');
    isValid = false;
  } else if (!isValidEmail(emailValue)) {
    setFieldError(null, email, 'Email formati noto\'g\'ri');
    isValid = false;
  }

  if (!passwordValue) {
    setFieldError(null, password, 'Parol kiritish shart');
    isValid = false;
  } else if (passwordValue.length < 6) {
    setFieldError(null, password, 'Parol kamida 6 ta belgi bo\'lishi kerak');
    isValid = false;
  }

  if (!confirmValue) {
    setFieldError(null, confirm, 'Parolni tasdiqlash shart');
    isValid = false;
  } else if (passwordValue !== confirmValue) {
    setFieldError(null, confirm, 'Parollar mos kelmaydi');
    isValid = false;
  }

  if (!isValid) return;

  setLoading(submitBtn, true);

  try {
    const result = await apiRequest('/auth/register', {
      username: usernameValue,
      email: emailValue,
      password: passwordValue,
      confirmPassword: confirmValue
    });

    if (result.success) {
      saveAuth(result.token, result.user);
      showToast(`Xush kelibsiz, ${result.user.username}! 1000 bonus ball qo'shildi!`, 'success');
      finishAuthRedirect();
    } else {
      showToast(result.message || 'Ro\'yxatdan o\'tishda xatolik', 'error');
    }
  } catch (error) {
    showToast('Serverga ulanib bo\'lmadi. Server ishlayotganligini tekshiring.', 'error');
  } finally {
    setLoading(submitBtn, false);
  }
}

async function handleLogin() {
  const email = document.getElementById('modalLoginEmail');
  const password = document.getElementById('modalLoginPassword');
  const submitBtn = document.getElementById('modalLoginBtn');

  let isValid = true;
  const emailValue = email.value.trim();
  const passwordValue = password.value;

  if (!emailValue) {
    setFieldError(null, email, 'Email kiritish shart');
    isValid = false;
  } else if (!isValidEmail(emailValue)) {
    setFieldError(null, email, 'Email formati noto\'g\'ri');
    isValid = false;
  }

  if (!passwordValue) {
    setFieldError(null, password, 'Parol kiritish shart');
    isValid = false;
  }

  if (!isValid) return;

  setLoading(submitBtn, true);

  try {
    const result = await apiRequest('/auth/login', { email: emailValue, password: passwordValue });

    if (result.success) {
      saveAuth(result.token, result.user);
      showToast(`Xush kelibsiz, ${result.user.username}!`, 'success');
      finishAuthRedirect();
    } else {
      showToast(result.message || 'Tizimga kirishda xatolik', 'error');
    }
  } catch (error) {
    showToast('Serverga ulanib bo\'lmadi. Server ishlayotganligini tekshiring.', 'error');
  } finally {
    setLoading(submitBtn, false);
  }
}

function finishAuthRedirect() {
  closeModal();
  renderAuthState();

  const redirectTo = pendingGame || '/games/sudoku';
  pendingGame = null;

  setTimeout(() => {
    window.location.href = redirectTo;
  }, 1200);
}

/* ============ GAME ACTIONS ============ */

function refreshDashboard() {
  renderAuthState();
}

function playGame(gameId) {
  if (!isAuthenticated()) {
    pendingGame = getGameUrl(gameId);
    openModal();
    return;
  }

  const url = getGameUrl(gameId);
  if (url) {
    window.location.href = url;
  } else {
    showToast('O\'yin hali tayyor emas', 'warning');
  }
}

function getGameUrl(gameId) {
  switch (gameId) {
    case 'sudoku':
      return '/games/sudoku';
    default:
      return null;
  }
}

/* ============ LOGOUT ============ */

function setupLogout() {
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('mobileLogoutBtn').addEventListener('click', handleLogout);
}

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  pendingGame = null;
  showToast('Tizimdan chiqdingiz', 'success');
  renderAuthState();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============ PARTICLES ============ */

function setupParticles() {
  const container = document.querySelector('.particles');
  if (!container) return;
  if (container.childElementCount > 0) return;
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
    particle.style.animationDelay = (Math.random() * 10) + 's';
    particle.style.width = particle.style.height = (Math.random() * 4 + 1) + 'px';
    container.appendChild(particle);
  }
}

/* ============ TOAST ============ */

function showToast(message, type = 'error') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', warning: '⚠' };
  toast.innerHTML = `<span class="toast-icon">${icons[type] || ''}</span><span>${message}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}