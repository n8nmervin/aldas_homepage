// Paste your published CSV URL here
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRnFW041zdJXMRav-fF9iQtmu6Ee6KDKlGfpZPt7YxQD6mWdwimz3jbDsza1wnyLFH2yxbbYeU9Ov5-/pub?gid=0&single=true&output=csv';

// Read URL parameters (e.g., ?id=snezhana)
const urlParams = new URLSearchParams(window.location.search);
const doctorId = urlParams.get('id');

// Function to handle rendering the doctor data
function renderDoctor(csvText) {
  const doctorsList = parseCSV(csvText);
  const doctor = doctorsList.find(d => d.id.toLowerCase() === doctorId?.toLowerCase());

  if (doctor && doctor.name && doctor.name.trim() !== "") {
    document.title = `${doctor.name} - Profile`;
    document.getElementById('doc-name').textContent = doctor.name;
    document.getElementById('doc-role').textContent = doctor.role || "Specialist";
    document.getElementById('doc-category').textContent = doctor.category || "MEDICAL SPECIALIST";
    
    document.getElementById('doc-img').src = doctor.image || "images/profile/default-avatar.jfif";
    document.getElementById('doc-img').alt = doctor.name;
    document.getElementById('doc-about').textContent = doctor.about || "Detailed profile information for this specialist is currently being updated. Please check back soon.";

    const servicesList = document.getElementById('doc-services');
    servicesList.innerHTML = '';
    
    const servicesArray = doctor.services ? doctor.services.split(',') : [];
    if (servicesArray.length > 0 && servicesArray[0].trim() !== "") {
      servicesArray.forEach(service => {
        if (service.trim()) {
          const li = document.createElement('li');
          li.textContent = service.trim();
          servicesList.appendChild(li);
        }
      });
    } else {
      const li = document.createElement('li');
      li.textContent = "Services information coming soon.";
      servicesList.appendChild(li);
    }
  } else {
    document.title = "Profile Coming Soon";
    document.getElementById('doc-name').textContent = "DR. SPECIALIST PROFILE";
    document.getElementById('doc-role').textContent = "Information Pending Update";
    document.getElementById('doc-category').textContent = "COMING SOON";
    document.getElementById('doc-img').src = "images/profile/default-avatar.jfif"; 
    document.getElementById('doc-about').textContent = "We are currently gathering and updating the credentials, biography, and service details for this specialist. Please check back shortly.";

    const servicesList = document.getElementById('doc-services');
    servicesList.innerHTML = '<li>Profile details under review</li>';
  }
}

// Check if data is already cached in browser memory
const cachedCSV = sessionStorage.getItem('doctorsCSV');

if (cachedCSV) {
  // Instant load from cache (0ms delay)
  renderDoctor(cachedCSV);
} else {
  // First load fetches from Google Sheets and saves to cache
  fetch(SHEET_CSV_URL)
    .then(response => response.text())
    .then(csvText => {
      sessionStorage.setItem('doctorsCSV', csvText); // Save to session storage
      renderDoctor(csvText);
    })
    .catch(error => {
      console.error("Error fetching Google Sheet data:", error);
      document.getElementById('doc-name').textContent = "Profile Temporarily Unavailable";
      document.getElementById('doc-about').textContent = "Unable to connect to the directory database. Please check your connection or try again later.";
    });
}

// Robust CSV parser
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).map(line => {
    const values = [];
    let insideQuote = false;
    let entry = '';
    
    for (let i = 0; i < line.length; i++) {
      let char = line[i];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        values.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    values.push(entry.trim());

    const entryObj = {};
    headers.forEach((header, index) => {
      let val = values[index] ? values[index].trim() : '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      }
      entryObj[header] = val;
    });
    return entryObj;
  });
}
