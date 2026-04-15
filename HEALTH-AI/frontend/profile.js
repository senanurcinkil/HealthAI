let currentUser = JSON.parse(sessionStorage.getItem("healthai_user"));

if (!currentUser) {
  currentUser = {
    id: 1,
    name: "Ali Yilmaz",
    email: "ali@metu.edu.tr",
    role: "engineer",
    institution: "METU",
    expertise: "Medical Imaging AI",
    city: "Ankara",
    is_suspended: false
  };

  sessionStorage.setItem("healthai_user", JSON.stringify(currentUser));
}

function loadProfile() {
  document.getElementById("fullName").value = currentUser.name || "";
  document.getElementById("email").value = currentUser.email || "";
  document.getElementById("institution").value = currentUser.institution || "";
  document.getElementById("expertise").value = currentUser.expertise || "";
  document.getElementById("city").value = currentUser.city || "";
  document.getElementById("role").value = currentUser.role || "";
}

function enableEdit() {
  document.getElementById("fullName").disabled = false;
  document.getElementById("email").disabled = false;
  document.getElementById("institution").disabled = false;
  document.getElementById("expertise").disabled = false;
  document.getElementById("city").disabled = false;
}

function saveProfile() {
  currentUser.name = document.getElementById("fullName").value.trim();
  currentUser.email = document.getElementById("email").value.trim();
  currentUser.institution = document.getElementById("institution").value.trim();
  currentUser.expertise = document.getElementById("expertise").value.trim();
  currentUser.city = document.getElementById("city").value.trim();

  sessionStorage.setItem("healthai_user", JSON.stringify(currentUser));

  document.getElementById("fullName").disabled = true;
  document.getElementById("email").disabled = true;
  document.getElementById("institution").disabled = true;
  document.getElementById("expertise").disabled = true;
  document.getElementById("city").disabled = true;

  alert("Profile updated successfully.");
}

function downloadMyData() {
  const blob = new Blob(
    [JSON.stringify(currentUser, null, 2)],
    { type: "application/json;charset=utf-8;" }
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "my_profile_data.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function deleteMyAccount() {
  const confirmed = confirm("Are you sure? This action cannot be undone.");
  if (!confirmed) return;

  sessionStorage.removeItem("healthai_user");
  sessionStorage.removeItem("healthai_role");

  alert("Your account has been deleted.");
  window.location.href = "login.html";
}

loadProfile();