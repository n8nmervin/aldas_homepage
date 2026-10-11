// 1. Centralized Data Object for All Doctors
const doctorsData = {
  snezhana: {
    name: "DR. SNEZHANA CHESHELKOSKA",
    role: "General Practitioner",
    category: "GENERAL PRACTICE",
    image: "images/profile/01snezhana.png",
    about: "Dr. Snezhana Cheshelkoska is an experienced General Practitioner specializing in comprehensive family healthcare, preventative medicine, and diagnostic consultations.",
    services: ["Routine Health Checkups", "Preventative Care & Screening", "Chronic Disease Management"]
  },
  raef: {
    name: "DR. RAEF GHATTAS",
    role: "General Practitioner",
    category: "GENERAL PRACTICE",
    image: "images/profile/02raef.png",
    about: "Dr. Raef Ghattas provides holistic primary care services focusing on evidence-based medicine and preventative health strategies.",
    services: ["Primary Care Consultations", "Acute Illness Management", "Health Risk Assessments"]
  },
  marcela: {
    name: "DR. MARCELA JIMENEZ",
    role: "General Practitioner",
    category: "GENERAL PRACTICE",
    image: "images/profile/03marcela.png",
    about: "Dr. Marcela Jimenez specializes in general outpatient consultations and health optimization.",
    services: ["General Health Checks", "Immunizations", "Wellness Counseling"]
  }
};

// 2. Read URL Parameters
const urlParams = new URLSearchParams(window.location.search);
const doctorId = urlParams.get('id');

// 3. Populate Page Data
const doctor = doctorsData[doctorId];

if (doctor) {
  document.title = `${doctor.name} - Profile`;
  document.getElementById('doc-name').textContent = doctor.name;
  document.getElementById('doc-role').textContent = doctor.role;
  document.getElementById('doc-category').textContent = doctor.category;
  document.getElementById('doc-img').src = doctor.image;
  document.getElementById('doc-img').alt = doctor.name;
  document.getElementById('doc-about').textContent = doctor.about;

  // Populate Services List
  const servicesList = document.getElementById('doc-services');
  servicesList.innerHTML = '';
  doctor.services.forEach(service => {
    const li = document.createElement('li');
    li.textContent = service;
    servicesList.appendChild(li);
  });
} else {
  document.getElementById('doc-name').textContent = "Doctor Profile Not Found";
  document.getElementById('doc-about').textContent = "Please return to the main directory and select a valid specialist.";
}