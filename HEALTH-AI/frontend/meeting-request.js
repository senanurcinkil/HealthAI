const params = new URLSearchParams(window.location.search);
const postId = Number(params.get("post_id"));

const post = MOCK_POSTS.find(p => p.id === postId);

const postInfo = document.getElementById("postInfo");
const messageInput = document.getElementById("message");
const charCount = document.getElementById("charCount");
const ndaSection = document.getElementById("ndaSection");
const ndaCheck = document.getElementById("ndaCheck");

if (!post) {
  postInfo.innerHTML = "<p>Post not found.</p>";
} else {
  postInfo.innerHTML = `
    <h2>${post.title}</h2>
    <p><strong>Domain:</strong> ${post.domain}</p>
    <p><strong>Status:</strong> ${post.status}</p>
    <p><strong>City:</strong> ${post.city}</p>
    <p><strong>Explanation:</strong> ${post.explanation}</p>
  `;

  if (post.confidentiality === "meeting_only") {
    ndaSection.style.display = "block";
  }
}

messageInput.addEventListener("input", () => {
  charCount.textContent = `${messageInput.value.length} / 300`;
});

function submitRequest() {
  if (!post) {
    alert("Post not found.");
    return;
  }

  const message = messageInput.value.trim();

  if (!message) {
    alert("Please enter a message.");
    return;
  }

  if (post.confidentiality === "meeting_only" && !ndaCheck.checked) {
    alert("You must accept the NDA to continue.");
    return;
  }

  const slot1Date = document.getElementById("date1").value;
  const slot1Time = document.getElementById("time1").value;
  const slot2Date = document.getElementById("date2").value;
  const slot2Time = document.getElementById("time2").value;
  const slot3Date = document.getElementById("date3").value;
  const slot3Time = document.getElementById("time3").value;

  const proposedSlots = [];

  if (slot1Date && slot1Time) proposedSlots.push(`${slot1Date} ${slot1Time}`);
  if (slot2Date && slot2Time) proposedSlots.push(`${slot2Date} ${slot2Time}`);
  if (slot3Date && slot3Time) proposedSlots.push(`${slot3Date} ${slot3Time}`);

  if (proposedSlots.length === 0) {
    alert("Please add at least one proposed time slot.");
    return;
  }

  const newRequest = {
    id: Date.now(),
    post_id: post.id,
    requester_id: 1,
    message: message,
    nda_accepted: post.confidentiality === "meeting_only" ? ndaCheck.checked : false,
    proposed_slots: proposedSlots,
    confirmed_slot: null,
    status: "pending",
    created_at: new Date().toISOString().slice(0, 10)
  };

  console.log("POST /api/meetings", newRequest);
  alert("Meeting request submitted successfully!");

  messageInput.value = "";
  charCount.textContent = "0 / 300";
  document.getElementById("date1").value = "";
  document.getElementById("time1").value = "";
  document.getElementById("date2").value = "";
  document.getElementById("time2").value = "";
  document.getElementById("date3").value = "";
  document.getElementById("time3").value = "";
  ndaCheck.checked = false;
}