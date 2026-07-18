// ============================================================
// SPORTA — script.js  (Sign In)
// ============================================================
// ▸ Validates email format + password length
// ▸ Checks credentials against saved users (localStorage)
// ▸ Links to Sign Up page
// ============================================================


// ===========================
// DOM REFERENCES
// ===========================
const form = document.getElementById('signinForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const submitBtn = form?.querySelector('.btn-signin');
const togglePass = document.getElementById('togglePass');
const signupLink = document.querySelector('.form-footer a');


// ===========================
// LINK → SIGN UP PAGE
// ===========================
if (signupLink) {
  signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'sign_up.html'; // ← غيّر الاسم لو مختلف
  });
}


// ===========================
// TOGGLE PASSWORD VISIBILITY
// ===========================
if (togglePass && passwordInput) {
  togglePass.addEventListener('click', function () {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePass.textContent = isPassword ? '🙈' : '👁️';
  });
}


// ===========================
// REAL-TIME CLEAR ON INPUT
// ===========================
emailInput?.addEventListener('input', () => clearError(emailInput, emailError));
passwordInput?.addEventListener('input', () => clearError(passwordInput, passwordError));


// ===========================
// FORM SUBMIT
// ===========================
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    let valid = true;

    // — Email validation —
    const emailVal = emailInput.value.trim();
    if (!emailVal) {
      showError(emailInput, emailError, '⚠️ Email is required.');
      valid = false;
    } else if (!isValidEmail(emailVal)) {
      showError(emailInput, emailError, '⚠️ Please enter a valid email address.');
      valid = false;
    } else {
      clearError(emailInput, emailError);
    }

    // — Password validation —
    const passVal = passwordInput.value;
    if (!passVal) {
      showError(passwordInput, passwordError, '⚠️ Password is required.');
      valid = false;
    } else if (passVal.length < 6) {
      showError(passwordInput, passwordError, '⚠️ Password must be at least 6 characters.');
      valid = false;
    } else {
      clearError(passwordInput, passwordError);
    }

    if (!valid) return;

    // — Authenticate against stored users —
    setLoading(true);
    setTimeout((e) => {
      // e.preventDefault()
      const result = authenticateUser(emailVal, passVal);
      setLoading(false);

      if (result.success) {
        showSuccessToast(`Welcome back, ${result.user.name.split(' ')[0]}! ✅`);
        form.reset();
        window.location.href = "../home.html"
        // هنا تقدر تعمل redirect لصفحة الـ dashboard
        // setTimeout(() => window.location.href = 'dashboard.html', 1500);
      } else {
        // بنحدد الخطأ بدقة للمستخدم
        if (result.reason === 'email_not_found') {
          showError(emailInput, emailError, '⚠️ No account found with this email. Sign up first.');
        } else if (result.reason === 'wrong_password') {
          showError(passwordInput, passwordError, '⚠️ Incorrect password. Please try again.');
        }
      }
    }, 1500);
  });
}


// ===========================
// SOCIAL BUTTONS
// ===========================
document.getElementById('appleBtn')?.addEventListener('click', () => {
  showInfoToast('🍎 Apple Sign In — coming soon!');
});

document.getElementById('googleBtn')?.addEventListener('click', () => {
  showInfoToast('🔵 Google Sign In — coming soon!');
});


// ===========================
// USER STORAGE HELPERS
// ===========================
function getUsers() {
  return JSON.parse(localStorage.getItem('sporta_users') || '[]');
}

// لو حابب تعمل تست من غير ما تعمل sign up الأول،
// بيضيف يوزر افتراضي لو المصفوفة فاضية
function ensureDefaultUser() {
  const users = getUsers();
  if (users.length === 0) {
    const demo = { name: 'Demo Athlete', email: 'demo@sporta.com', phone: '0000000', password: 'pass123' };
    localStorage.setItem('sporta_users', JSON.stringify([demo]));
    console.info('ℹ️ Demo user added: demo@sporta.com / pass123');
  }
}
ensureDefaultUser();

function authenticateUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) return { success: false, reason: 'email_not_found' };
  if (user.password !== password) return { success: false, reason: 'wrong_password' };
  return { success: true, user };
}


// ===========================
// HELPER FUNCTIONS
// ===========================
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(input, errorEl, message) {
  if (!errorEl) return;
  input.classList.add('input-error');
  input.classList.remove('input-success');
  errorEl.textContent = message;
}

function clearError(input, errorEl) {
  if (!errorEl) return;
  input.classList.remove('input-error');
  input.classList.add('input-success');
  errorEl.textContent = '';
}

function setLoading(state) {
  if (!submitBtn) return;
  if (state) {
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Signing In…';
    submitBtn.disabled = true;
  } else {
    submitBtn.classList.remove('loading');
    submitBtn.innerHTML = 'Sign In <span class="arrow">→</span>';
    submitBtn.disabled = false;
  }
}

function showSuccessToast(msg) {
  renderToast(msg, '#2ecc71');
}

function showInfoToast(msg) {
  renderToast(msg, '#4d9fff');
}

function renderToast(msg, color) {
  let toast = document.getElementById('sporta-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'sporta-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.borderColor = color;
  toast.style.color = color;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}