document.addEventListener("DOMContentLoaded", function () {
  const forms = document.querySelectorAll(".auth-form");

  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let isValid = true;

      const inputs = form.querySelectorAll("input[required]");
      inputs.forEach((input) => {
        if (!input.value.trim()) {
          isValid = false;
          input.style.borderColor = "red";
        } else {
          input.style.borderColor = "#ccc";
        }
      });

      const password = form.querySelector("#password");
      const confirmPassword = form.querySelector("#confirm-password");

      if (confirmPassword && password.value !== confirmPassword.value) {
        isValid = false;
        alert("Mật khẩu xác nhận không khớp!");
        confirmPassword.style.borderColor = "red";
      }

      if (isValid) {
        if (form.id === "student-login-form") {
          alert("Đăng nhập Sinh viên thành công! Chuyển đến Trang Chính...");
          window.location.href = "index.html";
        } else if (form.id === "student-register-form") {
          alert("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
          window.location.href = "login.html";
        } else if (form.id === "admin-login-form") {
          alert("Đăng nhập Admin thành công! Chuyển đến Dashboard...");
          window.location.href = "admin_dashboard.html";
        }
      }
    });
  });
});
