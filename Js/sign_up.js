//DOM REFERENCES
const signupForm = document.querySelector('form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const passInput = document.getElementById('password');
const submitBtn = document.querySelector('.btn-submit');
const signinLink = document.querySelector('.signin-link');
const toggleBtn = document.querySelector('.password-toggle');
const toggleIcon = toggleBtn?.querySelector('.material-symbols-outlined');


// ===========================
// LINK → SIGN IN PAGE
// ===========================
if (signinLink) {
  signinLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'sign_in.html'; // ← غيّر الاسم لو مختلف
  });
}


// ===========================
// TOGGLE PASSWORD VISIBILITY
// ===========================
if (toggleBtn && passInput) {
  toggleBtn.addEventListener('click', () => {
    const isHidden = passInput.type === 'password';
    passInput.type = isHidden ? 'text' : 'password';
    if (toggleIcon) toggleIcon.textContent = isHidden ? 'visibility_off' : 'visibility';
  });
}


// ===========================
// INJECT ERROR SPANS (once)
// ===========================
// بنضيف error spans تحت كل field ديناميكياً من غير ما نلمس الـ HTML
function injectErrorSpan(input) {
  const wrapper = input.closest('.field-group');
  if (!wrapper) return null;
  let span = wrapper.querySelector('.error-msg');
  if (!span) {
    span = document.createElement('span');
    span.className = 'error-msg';
    wrapper.appendChild(span);
  }
  return span;
}

const nameError = injectErrorSpan(nameInput);
const emailError = injectErrorSpan(emailInput);
const phoneError = injectErrorSpan(phoneInput);
const passError = injectErrorSpan(passInput);


// ===========================
// REAL-TIME CLEAR ON INPUT
// ===========================
nameInput?.addEventListener('input', () => clearError(nameInput, nameError));
emailInput?.addEventListener('input', () => clearError(emailInput, emailError));
phoneInput?.addEventListener('input', () => clearError(phoneInput, phoneError));
passInput?.addEventListener('input', () => {
  clearError(passInput, passError);
  updatePasswordStrength(passInput.value);
});


// ===========================
// PASSWORD STRENGTH INDICATOR
// ===========================
// بنضيف شريط strength تحت حقل الباسورد
const passWrapper = passInput?.closest('.field-group');
let strengthBar, strengthLabel;

if (passWrapper) {
  const strengthContainer = document.createElement('div');
  strengthContainer.className = 'strength-container';
  strengthContainer.innerHTML = `
    <div class="strength-bar-bg">
      <div class="strength-bar-fill" id="strengthFill"></div>
    </div>
    <span class="strength-label" id="strengthLabel"></span>
  `;
  passWrapper.appendChild(strengthContainer);
  strengthBar = document.getElementById('strengthFill');
  strengthLabel = document.getElementById('strengthLabel');
}

function updatePasswordStrength(val) {
  if (!strengthBar || !strengthLabel) return;
  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { label: '', color: 'transparent', width: '0%' },
    { label: 'Very Weak', color: '#ff4d4d', width: '20%' },
    { label: 'Weak', color: '#ff944d', width: '40%' },
    { label: 'Fair', color: '#ffd94d', width: '60%' },
    { label: 'Strong', color: '#7adb6e', width: '80%' },
    { label: 'Very Strong', color: '#2ecc71', width: '100%' },
  ];

  const level = levels[score] || levels[0];
  strengthBar.style.width = level.width;
  strengthBar.style.backgroundColor = level.color;
  strengthLabel.textContent = level.label;
  strengthLabel.style.color = level.color;
}


// ===========================
// FORM SUBMIT
// ===========================
if (signupForm) {
  signupForm.addEventListener('submit', function (e) {
    e.preventDefault();

    let valid = true;

    // — Full Name —
    const nameVal = nameInput.value.trim();
    if (!nameVal) {
      showError(nameInput, nameError, '⚠️ Full name is required.');
      valid = false;
    } else if (nameVal.length < 3) {
      showError(nameInput, nameError, '⚠️ Name must be at least 3 characters.');
      valid = false;
    } else {
      clearError(nameInput, nameError);
    }

    // — Email —
    const emailVal = emailInput.value.trim();
    if (!emailVal) {
      showError(emailInput, emailError, '⚠️ Email address is required.');
      valid = false;
    } else if (!isValidEmail(emailVal)) {
      showError(emailInput, emailError, '⚠️ Enter a valid email (e.g. john@sporta.com).');
      valid = false;
    } else if (emailAlreadyExists(emailVal)) {
      showError(emailInput, emailError, '⚠️ This email is already registered. Sign in instead.');
      valid = false;
    } else {
      clearError(emailInput, emailError);
    }

    // — Phone —
    const phoneVal = phoneInput.value.trim();
    if (!phoneVal) {
      showError(phoneInput, phoneError, '⚠️ Phone number is required.');
      valid = false;
    } else if (!isValidPhone(phoneVal)) {
      showError(phoneInput, phoneError, '⚠️ Enter a valid phone number (min 7 digits).');
      valid = false;
    } else {
      clearError(phoneInput, phoneError);
    }

    // — Password —
    const passVal = passInput.value;
    if (!passVal) {
      showError(passInput, passError, '⚠️ Password is required.');
      valid = false;
    } else if (passVal.length < 6) {
      showError(passInput, passError, '⚠️ Password must be at least 6 characters.');
      valid = false;
    } else if (!/[A-Za-z]/.test(passVal) || !/[0-9]/.test(passVal)) {
      showError(passInput, passError, '⚠️ Password must contain letters and numbers.');
      valid = false;
    } else {
      clearError(passInput, passError);
    }

    if (!valid) return;

    // — Save user & redirect —
    setLoading(true);
    setTimeout(() => {
      saveUser({ name: nameVal, email: emailVal, phone: phoneVal, password: passVal });
      setLoading(false);

      showSuccessToast(`Welcome, ${nameVal.split(' ')[0]}! 🎉 Account created.`);
      signupForm.reset();
      updatePasswordStrength('');

      // انتقل لصفحة Sign In بعد ثانيتين
      setTimeout(() => {
        window.location.href = 'sign_in.html'; // ← غيّر الاسم لو مختلف
        // ← غيّر الاسم لو مختلف
      }, 2000);
    }, 1500);
  });
}


// ===========================
// USER STORAGE (localStorage)
// ===========================
function getUsers() {
  return JSON.parse(localStorage.getItem('sporta_users') || '[]');
}

function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem('sporta_users', JSON.stringify(users));
}

function emailAlreadyExists(email) {
  return getUsers().some(u => u.email.toLowerCase() === email.toLowerCase());
}


// ===========================
// HELPER FUNCTIONS
// ===========================
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  // يقبل أرقام، مسافات، +، -, (, ) وعدد الأرقام يبقى 7 على الأقل
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
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
    submitBtn.innerHTML = 'Creating Account… <span class="material-symbols-outlined">hourglass_top</span>';
    submitBtn.disabled = true;
  } else {
    submitBtn.classList.remove('loading');
    submitBtn.innerHTML = 'Create Account <span class="material-symbols-outlined">arrow_forward</span>';
    submitBtn.disabled = false;
  }
}

function showSuccessToast(msg) {
  let toast = document.getElementById('sporta-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'sporta-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}