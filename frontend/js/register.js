document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirmPassword');
  const submitBtn = document.getElementById('submitBtn');

  passwordInput.addEventListener('input', () => {
    updatePasswordStrength(passwordInput.value);
  });

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
    input.classList.remove('success');
    const errorEl = input.closest('.form-group').querySelector('.error-message');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function setSuccess(input) {
    input.classList.remove('error');
    input.classList.add('success');
    clearError(input);
  }

  [usernameInput, emailInput, passwordInput, confirmInput].forEach(input => {
    input.addEventListener('input', () => clearError(input));
    input.addEventListener('focus', () => clearError(input));
  });

  confirmInput.addEventListener('input', () => {
    if (confirmInput.value && confirmInput.value !== passwordInput.value) {
      setError(confirmInput, 'Parollar mos kelmaydi');
    } else if (confirmInput.value && confirmInput.value === passwordInput.value) {
      setSuccess(confirmInput);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    if (!username) {
      setError(usernameInput, 'Username kiritish shart');
      isValid = false;
    } else if (username.length < 3) {
      setError(usernameInput, 'Username kamida 3 ta belgi bo\'lishi kerak');
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError(usernameInput, 'Username faqat harflar, raqamlar va _ dan iborat bo\'lishi kerak');
      isValid = false;
    }

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
    } else if (password.length < 6) {
      setError(passwordInput, 'Parol kamida 6 ta belgi bo\'lishi kerak');
      isValid = false;
    }

    if (!confirmPassword) {
      setError(confirmInput, 'Parolni tasdiqlash shart');
      isValid = false;
    } else if (password !== confirmPassword) {
      setError(confirmInput, 'Parollar mos kelmaydi');
      isValid = false;
    }

    if (!isValid) return;

    setLoading(submitBtn, true);

    try {
      const result = await apiRequest('/auth/register', {
        username,
        email,
        password,
        confirmPassword
      });

      if (result.success) {
        saveAuth(result.token, result.user);
        showToast(`Xush kelibsiz, ${result.user.username}! 1000 bonus ball sizning hisobingizga qo'shildi!`, 'success');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        showToast(result.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi', 'error');
      }
    } catch (error) {
      showToast('Serverga ulanib bo\'lmadi. Server ishlayotganligini tekshiring.', 'error');
    } finally {
      setLoading(submitBtn, false);
    }
  });
});
