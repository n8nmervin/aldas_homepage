const BULLETIN_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6UOUl7CC7t1amCRnbC0anRiC6FMP3q9GIqS8gubf18FHGl9gtFm8T5z9ns8w5NEI-njNQcUKQ7ucc/pub?gid=0&single=true&output=csv';
const SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwfg7eYX2-1Pkp_GxOKGOyDVb-5KslZQRQ94CfoDK7u02ALNuUB24fyJn3IqaUklUM/exec';

// Global array to keep track of kudos entries
let allKudos = [];

function fetchBulletinData() {
  fetch(BULLETIN_CSV_URL)
    .then(response => response.text())
    .then(csvText => {
      const rows = parseCSV(csvText);

      // 1. Announcements (Supports multiple rows!)
      const announcementRows = rows.filter(r => r.section === 'announcements');
      const annList = document.getElementById('ann-list');
      const annTitleEl = document.getElementById('ann-title');

      if (announcementRows.length > 0) {
        // Set title from the first announcement row found
        if (annTitleEl) annTitleEl.textContent = announcementRows[0].title || '📢 ANNOUNCEMENTS';
        
        if (annList) {
          annList.innerHTML = '';
          
          announcementRows.forEach(row => {
            // Check if content_1 has text
            if (row.content_1 && row.content_1.trim() !== '') {
              const li = document.createElement('li');
              
              const textSpan = document.createElement('span');
              textSpan.textContent = row.content_1;
              li.appendChild(textSpan);

              if (row.date) {
                const dateSpan = document.createElement('span');
                dateSpan.className = 'announcement-date';
                dateSpan.textContent = `Posted: ${row.date}`;
                li.appendChild(dateSpan);
              }

              annList.appendChild(li);
            }
          });
        }
      } else {
        if (annList) annList.innerHTML = '<li>No announcements posted.</li>';
      }

      // 2. Colleague of the Month (Picks the LAST/MOST RECENT colleague row in the sheet)
      const colleagueRows = rows.filter(r => r.section === 'colleague');
      const colRow = colleagueRows.length > 0 ? colleagueRows[colleagueRows.length - 1] : null;

      if (colRow) {
        const titleEl = document.getElementById('colleague-title');
        const nameEl = document.getElementById('colleague-name');
        const subEl = document.getElementById('colleague-sub');

        if (titleEl) titleEl.textContent = colRow.title || '⭐ COLLEAGUE OF THE MONTH';
        if (nameEl) nameEl.textContent = colRow.content_1 || '';
        if (subEl) subEl.textContent = colRow.content_2 || '';

        let mediaUrl = colRow.image ? colRow.image.trim() : 'images/profile/default-avatar.png';

        // Convert Google Drive view links to direct streaming links if necessary
        if (mediaUrl.includes('drive.google.com')) {
          const fileIdMatch = mediaUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
          if (fileIdMatch && fileIdMatch[1]) {
            mediaUrl = `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
          }
        }

        const mediaContainer = document.getElementById('colleague-media-container');
        if (mediaContainer) {
          const isVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(mediaUrl);
          mediaContainer.innerHTML = '';

          if (isVideo) {
            const video = document.createElement('video');
            video.src = mediaUrl;
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            mediaContainer.appendChild(video);
          } else {
            const img = document.createElement('img');
            img.src = mediaUrl;
            img.alt = colRow.content_1 || 'Colleague of the Month';
            mediaContainer.appendChild(img);
          }
        }
      }

      // 3. Multiple Kudos / Team Chat Feed
      allKudos = rows.filter(r => r.section === 'kudos');
      renderKudosList();
    })
    .catch(error => {
      console.error("Error fetching bulletin data:", error);
    });
}

// Function to render the kudos feed (newest first)
function renderKudosList() {
  const container = document.getElementById('kudos-container');
  if (!container) return;
  
  container.innerHTML = '';

  if (allKudos.length === 0) {
    container.innerHTML = '<div class="kudos-item"><p class="kudos-text">No kudos posted yet. Be the first!</p></div>';
    return;
  }

  // Reverse array so latest entries appear at the top
  [...allKudos].reverse().forEach(kudos => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'kudos-item';

    const textP = document.createElement('p');
    textP.className = 'kudos-text';
    textP.textContent = `"${kudos.content_1}"`;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'kudos-meta';

    const authorSpan = document.createElement('span');
    let authorName = kudos.author || kudos.content_2 || 'Anonymous';
    authorSpan.textContent = authorName.startsWith('—') ? authorName : `— ${authorName}`;

    const timeSpan = document.createElement('span');
    timeSpan.textContent = kudos.date || 'Just now';

    metaDiv.appendChild(authorSpan);
    metaDiv.appendChild(timeSpan);

    itemDiv.appendChild(textP);
    itemDiv.appendChild(metaDiv);
    container.appendChild(itemDiv);
  });
}

// Initial fetch on page load
fetchBulletinData();

// Handle Kudos Submission Form
const kudosForm = document.getElementById('kudos-form');
if (kudosForm) {
  kudosForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const messageInput = document.getElementById('kudos-input');
    const authorInput = document.getElementById('author-input');
    const statusSpan = document.getElementById('kudos-status');
    const submitBtn = document.getElementById('kudos-submit-btn');

    const message = messageInput.value.trim();
    const author = authorInput.value.trim() || 'Anonymous';

    if (!message) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';
    statusSpan.textContent = 'Saving...';

    fetch(SCRIPT_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message, author: author })
    })
      .then(() => {
        // Optimistically add to local array and re-render instantly
        allKudos.push({
          section: 'kudos',
          content_1: message,
          author: author,
          date: 'Just now'
        });
        renderKudosList();

        messageInput.value = '';
        authorInput.value = '';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post Kudos 📌';
        statusSpan.textContent = 'Posted successfully!';

        setTimeout(() => {
          statusSpan.textContent = 'Live syncs directly to Google Sheet';
        }, 3000);
      })
      .catch(error => {
        console.error('Error posting kudos:', error);
        statusSpan.textContent = 'Failed to post.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post Kudos 📌';
      });
  });
}

// Robust CSV Parser
function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

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