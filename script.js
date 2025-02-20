const businessNameInput = document.getElementById('businessName');
const colorPicker = document.getElementById('colorPicker');
const logoInput = document.getElementById('logo');
const dropZone = document.getElementById('dropZone');
const cardPreview = document.getElementById('cardPreview');
const cardName = document.getElementById('cardName');
const previewLocations = document.getElementById('previewLocations');
const previewLogo = document.getElementById('previewLogo');

businessNameInput.addEventListener('input', function() {
    cardName.textContent = this.value.trim() || 'Your Business Name';
});

colorPicker.addEventListener('input', function() {
    cardPreview.style.backgroundColor = this.value;
});

// File input change handler
logoInput.addEventListener('change', handleFileSelect);

// Drag and drop handlers
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        logoInput.files = files;
        handleFileSelect({ target: logoInput });
    }
});

dropZone.addEventListener('click', () => {
    logoInput.click();
});

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewLogo.src = e.target.result;
            previewLogo.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

window.addLocation = function() {
    const newGroup = document.createElement('div');
    newGroup.className = 'location-group grid grid-cols-11 gap-2 items-center';
    
    const newLocationInput = document.createElement('input');
    newLocationInput.type = 'text';
    newLocationInput.className = 'location-input p-2 w-full border rounded col-span-5';
    newLocationInput.placeholder = 'Enter location';
    
    const newHoursInput = document.createElement('input');
    newHoursInput.type = 'text';
    newHoursInput.className = 'hours-input p-2 w-full border rounded col-span-5';
    newHoursInput.placeholder = 'Enter hours';
    
    const newAddButton = document.createElement('button');
    newAddButton.className = 'add-location bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 col-span-1';
    newAddButton.textContent = '+';
    newAddButton.onclick = addLocation;
    
    newGroup.appendChild(newLocationInput);
    newGroup.appendChild(newHoursInput);
    newGroup.appendChild(newAddButton);
    
    const existingButtons = document.querySelectorAll('.add-location');
    const lastButton = existingButtons[existingButtons.length - 1];
    if (lastButton) lastButton.removeAttribute('onclick');
    
    document.getElementById('locations').appendChild(newGroup);
    
    newLocationInput.addEventListener('input', updateLocationPreview);
    newHoursInput.addEventListener('input', updateLocationPreview);
    updateLocationPreview();
}

function updateLocationPreview() {
    const locationGroups = document.getElementsByClassName('location-group');
    previewLocations.innerHTML = '';
    Array.from(locationGroups).forEach(group => {
        const locationInput = group.querySelector('.location-input');
        const hoursInput = group.querySelector('.hours-input');
        const locationValue = locationInput.value.trim();
        const hoursValue = hoursInput.value.trim();
        
        if (locationValue) {
            previewLocations.innerHTML += `<p>Location: ${locationValue}</p>`;
            previewLocations.innerHTML += `<p>Hours: ${hoursValue || 'Your Hours'}</p>`;
        }
    });
    if (!previewLocations.innerHTML) {
        previewLocations.innerHTML = '<p>Location: Your Location</p><p>Hours: Your Hours</p>';
    }
}

// ... (previous code remains unchanged)

window.generateCard = function() {
  const locationGroups = document.getElementsByClassName('location-group');
  let locationsHTML = '';
  let numColumns = locationGroups.length > 0 ? locationGroups.length : 1;

  // Start building the HTML for the locations
  locationsHTML += `<div style="display: flex; justify-content: space-between;">`;
  
  Array.from(locationGroups).forEach((group, index) => {
      const locationInput = group.querySelector('.location-input');
      const hoursInput = group.querySelector('.hours-input');
      const locationValue = locationInput.value.trim();
      const hoursValue = hoursInput.value.trim();
      
      if (locationValue) {
          locationsHTML += `
              <div style="flex: 1; padding: 0 10px;">
                  <p>Location: ${locationValue}</p>
                  <p>Hours: ${hoursValue || 'Your Hours'}</p>
              </div>
          `;
      }
  });
  
  locationsHTML += '</div>';

  // If no locations were entered, default to one column with placeholder text
  if (locationsHTML === '<div style="display: flex; justify-content: space-between;"></div>') {
      locationsHTML = `<p>Location: Your Location</p><p>Hours: Your Hours</p>`;
  }

  const cardHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${businessNameInput.value || 'Business Card'}</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  margin: 0;
                  background: #f0f0f0;
              }
              .business-card {
                  width: 400px;
                  padding: 20px;
                  border-radius: 10px;
                  color: white;
                  background-color: ${colorPicker.value};
                  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              }
              .business-card img {
                  max-width: 100px;
                  max-height: 100px;
                  margin: 10px 0;
              }
              h1 { margin: 0 0 10px 0; }
          </style>
      </head>
      <body>
          <div class="business-card">
              <h1>${businessNameInput.value || 'Your Business Name'}</h1>
              ${previewLogo.src ? `<img src="${previewLogo.src}">` : ''}
              ${locationsHTML}
          </div>
      </body>
      </html>
  `;

  const newWindow = window.open('');
  if (newWindow) {
      newWindow.document.write(cardHTML);
      newWindow.document.close();
  }
}

// ... (rest of the code remains unchanged)

// Initial setup
cardPreview.style.backgroundColor = colorPicker.value;
document.querySelector('.location-input').addEventListener('input', updateLocationPreview);
document.querySelector('.hours-input').addEventListener('input', updateLocationPreview);