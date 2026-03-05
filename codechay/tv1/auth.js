// simple script to toggle password visibility
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".pw-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      // button id like togglePw or toggleConfirmPw
      const inputId =
        btn.getAttribute("aria-controls") || btn.previousElementSibling?.id;
      const input = document.getElementById(inputId);
      if (!input) return;
      const shown = input.type === "text";
      input.type = shown ? "password" : "text";
      btn.textContent = shown ? "Hiện" : "Ẩn";
    });
  });
});
