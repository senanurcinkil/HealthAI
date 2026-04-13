// =============================================
// SHARED MOCK DATA - healthai-cocreation
// All team members use this file
// =============================================

const MOCK_USERS = [
  { id: 1, name: "Ali Yilmaz",      email: "ali@metu.edu.tr",     role: "engineer",  institution: "METU",     expertise: "Medical Imaging AI", city: "Ankara",   is_suspended: false },
  { id: 2, name: "Selin Kaya",      email: "selin@hacettepe.edu.tr", role: "engineer", institution: "Hacettepe", expertise: "Embedded Systems", city: "Ankara", is_suspended: false },
  { id: 3, name: "Dr. Mehmet Oz",   email: "m.oz@istanbul.edu.tr", role: "doctor",   institution: "Istanbul University Hospital", expertise: "Cardiology", city: "Istanbul", is_suspended: false },
  { id: 4, name: "Dr. Ayse Demir",  email: "a.demir@ege.edu.tr",  role: "doctor",    institution: "Ege University Hospital",     expertise: "Oncology",   city: "Izmir",    is_suspended: false },
  { id: 5, name: "Admin User",      email: "admin@healthai.edu",  role: "admin",     institution: "HealthAI Platform",           expertise: "-",          city: "-",        is_suspended: false },
];

const MOCK_POSTS = [
  {
    id: 1,
    user_id: 1,
    title: "AI-Powered ECG Analysis Tool",
    domain: "Cardiology",
    role_type: "engineer",
    stage: "prototype",
    status: "active",
    explanation: "We have developed an LSTM-based model for arrhythmia detection from ECG signals. Looking for a cardiologist to validate clinical relevance and help design the evaluation protocol.",
    expertise_needed: "Cardiologist with ECG interpretation experience",
    collaboration_type: "research_partner",
    confidentiality: "public",
    commitment: "Part-time (5-10 hrs/week)",
    expiry_date: "2026-06-01",
    city: "Ankara",
    country: "Turkey",
    auto_close: true,
    created_at: "2026-03-15"
  },
  {
    id: 2,
    user_id: 3,
    title: "Remote Patient Monitoring for Heart Failure",
    domain: "Cardiology",
    role_type: "doctor",
    stage: "idea",
    status: "active",
    explanation: "I see 200+ heart failure patients monthly. I believe a wearable + ML system could detect decompensation 48h early. Need an engineer to scope feasibility.",
    expertise_needed: "IoT / wearable sensor engineer with ML background",
    collaboration_type: "co_founder",
    confidentiality: "meeting_only",
    commitment: "Full-time potential",
    expiry_date: "2026-05-15",
    city: "Istanbul",
    country: "Turkey",
    auto_close: false,
    created_at: "2026-03-20"
  },
  {
    id: 3,
    user_id: 2,
    title: "Smart Insulin Delivery Algorithm",
    domain: "Endocrinology",
    role_type: "engineer",
    stage: "concept_validation",
    status: "meeting_scheduled",
    explanation: "Closed-loop insulin delivery PID controller prototype built. Need an endocrinologist to validate glucose dynamics model and advise on safety thresholds.",
    expertise_needed: "Endocrinologist specializing in diabetes management",
    collaboration_type: "advisor",
    confidentiality: "public",
    commitment: "Advisory (2-3 hrs/week)",
    expiry_date: "2026-07-01",
    city: "Ankara",
    country: "Turkey",
    auto_close: false,
    created_at: "2026-04-01"
  },
  {
    id: 4,
    user_id: 4,
    title: "Breast Cancer Screening Assistance Tool",
    domain: "Oncology",
    role_type: "doctor",
    stage: "pilot_testing",
    status: "partner_found",
    explanation: "Conducting pilot study on AI-assisted mammography reading. The engineering partner has been found.",
    expertise_needed: "Computer vision engineer",
    collaboration_type: "research_partner",
    confidentiality: "meeting_only",
    commitment: "Part-time",
    expiry_date: "2026-05-01",
    city: "Izmir",
    country: "Turkey",
    auto_close: true,
    created_at: "2026-02-10"
  },
  {
    id: 5,
    user_id: 1,
    title: "Retinal Disease Detection via Fundus Images",
    domain: "Ophthalmology",
    role_type: "engineer",
    stage: "idea",
    status: "draft",
    explanation: "Draft post - not yet published.",
    expertise_needed: "Ophthalmologist",
    collaboration_type: "research_partner",
    confidentiality: "public",
    commitment: "TBD",
    expiry_date: "2026-08-01",
    city: "Ankara",
    country: "Turkey",
    auto_close: false,
    created_at: "2026-04-10"
  }
];

const MOCK_MEETING_REQUESTS = [
  {
    id: 1,
    post_id: 3,
    requester_id: 3,
    message: "I have extensive experience with glucose dynamics and would love to collaborate.",
    nda_accepted: false,
    proposed_slots: ["2026-04-20 14:00", "2026-04-21 10:00", "2026-04-22 16:00"],
    confirmed_slot: "2026-04-21 10:00",
    status: "confirmed",
    created_at: "2026-04-05"
  }
];

const MOCK_ACTIVITY_LOGS = [
  { id: 1, user_id: 1, action: "POST_CREATED",   target_type: "post", target_id: 1, timestamp: "2026-03-15 09:12" },
  { id: 2, user_id: 3, action: "USER_LOGIN",      target_type: "user", target_id: 3, timestamp: "2026-03-20 11:30" },
  { id: 3, user_id: 3, action: "POST_CREATED",   target_type: "post", target_id: 2, timestamp: "2026-03-20 11:45" },
  { id: 4, user_id: 2, action: "POST_CREATED",   target_type: "post", target_id: 3, timestamp: "2026-04-01 08:00" },
  { id: 5, user_id: 3, action: "MEETING_REQUEST", target_type: "meeting_request", target_id: 1, timestamp: "2026-04-05 14:20" },
  { id: 6, user_id: 2, action: "MEETING_CONFIRMED", target_type: "meeting_request", target_id: 1, timestamp: "2026-04-06 09:00" },
];

// Session helpers
function getCurrentUser() {
  const raw = sessionStorage.getItem('healthai_user');
  return raw ? JSON.parse(raw) : null;
}

function requireLogin() {
  if (!getCurrentUser()) {
    window.location.href = 'login.html';
  }
}

// Domain options
const DOMAINS = [
  "Cardiology", "Oncology", "Neurology", "Endocrinology", "Ophthalmology",
  "Radiology", "Orthopedics", "Dermatology", "Psychiatry", "Pulmonology",
  "Gastroenterology", "Nephrology", "Infectious Disease", "Emergency Medicine", "Other"
];

const STAGES = [
  { value: "idea",              label: "Idea" },
  { value: "concept_validation",label: "Concept Validation" },
  { value: "prototype",         label: "Prototype Developed" },
  { value: "pilot_testing",     label: "Pilot Testing" },
  { value: "pre_deployment",    label: "Pre-Deployment" },
];

const STATUS_META = {
  draft:             { label: "Draft",             color: "#6b7280" },
  active:            { label: "Active",            color: "#16a34a" },
  meeting_scheduled: { label: "Meeting Scheduled", color: "#2563eb" },
  partner_found:     { label: "Partner Found",     color: "#7c3aed" },
  expired:           { label: "Expired",           color: "#dc2626" },
};
