// auth.js – modular form validation and submission for codechay/tv1

function isEmpty(value) {
  return !value.trim();
}

function validateEmailField(input) {
  const val = input.value.trim();
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(val)) {
    input.style.borderColor = "red";
    alert("Vui lòng nhập địa chỉ email hợp lệ.");
    return false;
  }
  return true;
}

function validateUsernameField(input) {
  const val = input.value.trim();
  const pattern = /^[a-zA-Z0-9_\.]{3,}$/;
  if (!pattern.test(val)) {
    input.style.borderColor = "red";
    alert(
      "Tên đăng nhập phải có ít nhất 3 ký tự và không chứa ký tự đặc biệt.",
    );
    return false;
  }
  return true;
}

function validatePasswordField(input) {
  const val = input.value;
  if (val.length < 6) {
    input.style.borderColor = "red";
    alert("Mật khẩu phải có ít nhất 6 ký tự.");
    return false;
  }
  return true;
}

function validateInputs(form) {
  let valid = true;
  const inputs = form.querySelectorAll("input[required]");
  inputs.forEach((input) => {
    const value = input.value.trim();
    if (!value) {
      valid = false;
      input.style.borderColor = "red";
      return;
    }
    input.style.borderColor = "#ccc";

    switch (input.name || input.id) {
      case "email":
        if (!validateEmailField(input)) valid = false;
        break;
      case "username":
        if (!validateUsernameField(input)) valid = false;
        break;
      case "password":
        if (!validatePasswordField(input)) valid = false;
        break;
    }
  });

  const password = form.querySelector("#password");
  const confirm = form.querySelector("#confirm-password");
  if (confirm && password && password.value !== confirm.value) {
    valid = false;
    alert("Mật khẩu xác nhận không khớp!");
    confirm.style.borderColor = "red";
  }

  return valid;
}

function handleSubmission(form) {
  if (!validateInputs(form)) return;

  switch (form.id) {
    case "student-login-form":
      alert("Đăng nhập Sinh viên thành công! Chuyển đến Trang Chính...");
      window.location.href = "index.html";
      break;
    case "student-register-form":
      alert("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
      window.location.href = "login.html";
      break;
    case "admin-login-form":
      alert("Đăng nhập Admin thành công! Chuyển đến Dashboard...");
      window.location.href = "admin_dashboard.html";
      break;
  }
}

function attachFormListeners() {
  const forms = document.querySelectorAll(".auth-form");
  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      handleSubmission(form);
    });
  });
}

// initialize on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", attachFormListeners);
} else {
  attachFormListeners();
}
