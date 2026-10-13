const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRnFW041zdJXMRav-fF9iQtmu6Ee6KDKlGfpZPt7YxQD6mWdwimz3jbDsza1wnyLFH2yxbbYeU9Ov5-/pub?gid=0&single=true&output=csv';

// Helper function to convert CSV text into array of objects
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).map(line => {
    // Regex handles commas inside quotes cleanly
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    const entry = {};
    headers.forEach((header, index) => {
      let val = values[index] ? values[index].trim() : '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      }
      entry[header] = val;
    });
    return entry;
  });
}

// Read URL parameters (e.g., ?id=snezhana)
const urlParams = new URLSearchParams(window.location.search);
const doctorId = urlParams.get('id');

// Fetch live spreadsheet data
fetch(SHEET_CSV_URL)
  .then(response => response.text())
  .then(csvText => {
    const doctorsList = parseCSV(csvText);
    const doctor = doctorsList.find(d => d.id.toLowerCase() === doctorId?.toLowerCase());

    if (doctor) {
      document.title = `${doctor.name} - Profile`;
      document.getElementById('doc-name').textContent = doctor.name;
      document.getElementById('doc-role').textContent = doctor.role;
      document.getElementById('doc-category').textContent = doctor.category;
      document.getElementById('doc-img').src = doctor.image;
      document.getElementById('doc-img').alt = doctor.name;
      document.getElementById('doc-about').textContent = doctor.about;

      // Split comma-separated services into <li> elements
      const servicesList = document.getElementById('doc-services');
      servicesList.innerHTML = '';
      
      const servicesArray = doctor.services ? doctor.services.split(',') : [];
      servicesArray.forEach(service => {
        if (service.trim()) {
          const li = document.createElement('li');
          li.textContent = service.trim();
          servicesList.appendChild(li);
        }
      });
    } else {
      document.getElementById('doc-name').textContent = "Doctor Profile Not Found";
      document.getElementById('doc-about').textContent = "Please return to the main directory and select a valid specialist.";
    }
  })
  .catch(error => {
    console.error("Error fetching Google Sheet data:", error);
    document.getElementById('doc-name').textContent = "Error Loading Profile";
  });
