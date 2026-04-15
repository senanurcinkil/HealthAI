document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;
    const role = document.getElementById("role").value;
    const error = document.getElementById("error");

    // 🔴 .edu kontrolü
    if (!email.endsWith(".edu") && !email.includes(".edu.")) {
        error.textContent = ".edu email kullanmalısın!";
        return;
    }

    // 🔴 şifre kontrol
    if (password !== confirm) {
        error.textContent = "Şifreler eşleşmiyor!";
        return;
    }

    // 🔴 rol kontrol
    if (!role) {
        error.textContent = "Rol seçmelisin!";
        return;
    }

    // 🔥 yeni user oluştur
    const newUser = {
        id: MOCK_USERS.length + 1,
        name: name,
        email: email,
        role: role,
        institution: "Unknown",
        expertise: "-",
        city: "-",
        is_suspended: false
    };

    // 🔥 mock database'e ekle
    MOCK_USERS.push(newUser);

    console.log("[POST /api/auth/register]", newUser);

    alert("Kayıt başarılı!");

    window.location.href = "login.html";
});