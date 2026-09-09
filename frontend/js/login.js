document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const submitBtn = document.getElementById('submitBtn');

  function clearError(input) {
    input.classList.remove('error');
    const errorEl = input.closest('.form-group').querySelector('.error-message');
    if (errorEl) {
      errorEl.classList.remove('visible');
      errorEl.textContent = '';
    }
  }

  function setError(input, message) {
    input.classList.add('error');
    const errorEl = input.closest('.form-group').querySelector('.error-message');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  [emailInput, passwordInput].forEach(input => {
    input.addEventListener('input', () => clearError(input));
    input.addEventListener('focus', () => clearError(input));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email) {
      setError(emailInput, 'Email kiritish shart');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setError(emailInput, 'Email formati noto\'g\'ri');
      isValid = false;
    }

    if (!password) {
      setError(passwordInput, 'Parol kiritish shart');
      isValid = false;
    }

    if (!isValid) return;

    setLoading(submitBtn, true);

    try {
      const result = await apiRequest('/auth/login', { email, password });

      if (result.success) {
        saveAuth(result.token, result.user);
        showToast(`Xush kelibsiz, ${result.user.username}!`, 'success');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1200);
      } else {
        showToast(result.message || 'Tizimga kirishda xatolik', 'error');
      }
    } catch (error) {
      showToast('Serverga ulanib bo\'lmadi. Server ishlayotganligini tekshiring.', 'error');
    } finally {
      setLoading(submitBtn, false);
    }
  });
});
