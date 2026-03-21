// auth.js - backend auth for codechay FE

function validateEmailField(input) {
  const val = input.value.trim();
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(val)) {
    input.style.borderColor = 'red';
    alert('Vui long nhap dia chi email hop le.');
    return false;
  }
  return true;
}

function validateUsernameField(input) {
  const val = input.value.trim();
  const pattern = /^[a-zA-Z0-9_\.]{3,}$/;
  if (!pattern.test(val)) {
    input.style.borderColor = 'red';
    alert('Ten dang nhap phai co it nhat 3 ky tu.');
    return false;
  }
  return true;
}

function validatePasswordField(input) {
  if (input.value.length < 6) {
    input.style.borderColor = 'red';
    alert('Mat khau phai co it nhat 6 ky tu.');
    return false;
  }
  return true;
}

function validateInputs(form) {
  let valid = true;
  const inputs = form.querySelectorAll('input[required]');
  inputs.forEach((input) => {
    const value = input.value.trim();
    if (!value) {
      valid = false;
      input.style.borderColor = 'red';
      return;
    }
    input.style.borderColor = '#ccc';

    switch (input.name || input.id) {
      case 'email':
        if (!validateEmailField(input)) valid = false;
        break;
      case 'username':
        if (!validateUsernameField(input)) valid = false;
        break;
      case 'password':
        if (!validatePasswordField(input)) valid = false;
        break;
    }
  });

  const password = form.querySelector('#password');
  const confirm = form.querySelector('#confirm-password');
  if (confirm && password && password.value !== confirm.value) {
    valid = false;
    alert('Mat khau xac nhan khong khop!');
    confirm.style.borderColor = 'red';
  }

  return valid;
}

async function handleSubmission(form) {
  if (!validateInputs(form)) return;

  try {
    switch (form.id) {
      case 'student-login-form': {
        const username = form.querySelector('#username').value.trim();
        const password = form.querySelector('#password').value.trim();
        const res = await ApiClient.request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ usernameOrEmail: username, password }),
        });
        ApiClient.setAuth(res, res.user, 'student');
        window.location.href = './index.html';
        break;
      }
      case 'student-register-form': {
        const username = form.querySelector('#username').value.trim();
        const email = form.querySelector('#email').value.trim();
        const password = form.querySelector('#password').value.trim();
        const confirmPassword = form.querySelector('#confirm-password').value.trim();
        await ApiClient.request('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ username, email, password, confirmPassword }),
        });
        alert('Dang ky tai khoan thanh cong! Vui long dang nhap.');
        window.location.href = './login.html';
        break;
      }
      case 'admin-login-form': {
        const username = form.querySelector('#username').value.trim();
        const password = form.querySelector('#password').value.trim();
        const res = await ApiClient.request('/auth/admin/login', {
          method: 'POST',
          body: JSON.stringify({ usernameOrEmail: username, password }),
        });
        ApiClient.setAuth(res, res.user, 'admin');
        window.location.href = './dashboard.html';
        break;
      }
    }
  } catch (err) {
    alert(err.message || 'Xu ly xac thuc that bai.');
  }
}

function attachFormListeners() {
  const forms = document.querySelectorAll('.auth-form');
  forms.forEach((form) => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      handleSubmission(form);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachFormListeners);
} else {
  attachFormListeners();
}
