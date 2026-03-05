document.addEventListener("DOMContentLoaded", function () {
  const forms = document.querySelectorAll(".auth-form");

  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault(); // Chặn hành vi submit mặc định
      let isValid = true;

      // Validate các trường không được để trống
      const inputs = form.querySelectorAll("input[required]");
      inputs.forEach((input) => {
        if (!input.value.trim()) {
          isValid = false;
          input.style.borderColor = "red";
        } else {
          input.style.borderColor = "#ccc";
        }
      });

      // Validate mật khẩu xác nhận (ở trang đăng ký)
      const password = form.querySelector("#password");
      const confirmPassword = form.querySelector("#confirm-password");

      if (confirmPassword && password.value !== confirmPassword.value) {
        isValid = false;
        alert("Mật khẩu xác nhận không khớp!");
        confirmPassword.style.borderColor = "red";
      }

      // Xử lý mô phỏng (Demo) khi dữ liệu hợp lệ
      if (isValid) {
        if (form.id === "student-login-form") {
          alert("Đăng nhập Sinh viên thành công! Chuyển đến Trang Chính...");
          window.location.href = "index.html"; // Chuyển tới trang thi
        } else if (form.id === "student-register-form") {
          alert("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
          window.location.href = "login.html"; // Quay lại trang login
        } else if (form.id === "admin-login-form") {
          alert("Đăng nhập Admin thành công! Chuyển đến Dashboard...");
          window.location.href = "admin_dashboard.html"; // Chuyển tới trang quản trị
        }
      }
    });
  });
});
