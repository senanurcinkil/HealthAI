// Sayfa açıldığında: eğer zaten login olmuşsa dashboard'a at
if (sessionStorage.getItem("healthai_user")) {
    window.location.href = "dashboard.html";
}

// Form submit
document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    // inputları al
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const error = document.getElementById("error");

    // hata mesajını sıfırla
    error.textContent = "";

    // 🔍 mock-data.js'ten user bul
    const user = MOCK_USERS.find(u => u.email === email);

    // ❌ user yoksa
    if (!user) {
        error.textContent = "User not found!";
        return;
    }

    // ❌ şifre yanlışsa (mock sistem)
    if (password !== "1234") {
        error.textContent = "Wrong password!";
        return;
    }

    // ✅ LOGIN SUCCESS

    // 🔥 HOCANIN İSTEDİĞİ SESSION
    sessionStorage.setItem("healthai_user", JSON.stringify(user));
    sessionStorage.setItem("healthai_role", user.role);

    // 🔥 MOCK API CALL
    console.log("[POST /api/auth/login]", {
        email: email,
        role: user.role
    });

    // 👉 yönlendirme
    window.location.href = "dashboard.html";
});