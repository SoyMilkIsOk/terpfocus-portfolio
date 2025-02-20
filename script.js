const businessNameInput = document.getElementById('businessName');
const fgColor = document.getElementById('fgColor');
const cardColor = document.getElementById('cardColor');
const bgColor = document.getElementById('bgColor');
const bgImage = document.getElementById('bgImage');
const bgToggle = document.getElementById('bgToggle');
const buttonColor = document.getElementById('buttonColor');
const bgColorInput = document.getElementById('bgColorInput');
const bgImageInput = document.getElementById('bgImageInput');
const logoInput = document.getElementById('logo');
const dropZoneLogo = document.getElementById('dropZoneLogo');
const dropZoneBg = document.getElementById('dropZoneBg');
const instagramInput = document.getElementById('instagram');
const weedmapsInput = document.getElementById('weedmaps');
const cardPreview = document.getElementById('cardPreview');
const cardName = document.getElementById('cardName');
const previewLocations = document.getElementById('previewLocations');
const previewLogo = document.getElementById('previewLogo');
const socialIcons = document.getElementById('socialIcons');
const shopNowContainer = document.getElementById('shopNowContainer');
const previewPane = document.querySelector('.preview-pane');
const colorText = document.getElementById('colorText');
const imageText = document.getElementById('imageText');
const slider = document.querySelector('.slider');

// Social media icons
const instagramIcon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/2048px-Instagram_icon.png';
const weedmapsIcon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Weedmaps_logo.svg/2048px-Weedmaps_logo.svg.png';

// Variable to store background image data
let backgroundImageData = '';

// Event Listeners
businessNameInput.addEventListener('input', () => {
    cardName.textContent = businessNameInput.value.trim() || 'Your Business Name';
});

fgColor.addEventListener('input', () => {
    cardPreview.style.color = fgColor.value;
    cardName.style.color = fgColor.value;
    previewLogo.style.borderColor = fgColor.value;
});

cardColor.addEventListener('input', () => {
    cardPreview.style.backgroundColor = cardColor.value;
});

bgColor.addEventListener('input', () => {
    previewPane.style.backgroundImage = 'none';
    previewPane.style.backgroundColor = bgColor.value;
    backgroundImageData = '';
});

buttonColor.addEventListener('input', () => {
    updateSocialIcons();
});

bgToggle.addEventListener('change', () => {
    if (bgToggle.checked) {
        bgColorInput.classList.add('hidden');
        bgImageInput.classList.remove('hidden');
        colorText.classList.add('inactive-text');
        imageText.classList.remove('inactive-text');
        slider.classList.remove('color-selected');
        slider.classList.add('image-selected');
        if (bgImage.files[0]) {
            handleFileSelect({ target: bgImage });
        }
    } else {
        bgColorInput.classList.remove('hidden');
        bgImageInput.classList.add('hidden');
        colorText.classList.remove('inactive-text');
        imageText.classList.add('inactive-text');
        slider.classList.remove('image-selected');
        slider.classList.add('color-selected');
        previewPane.style.backgroundImage = 'none';
        previewPane.style.backgroundColor = bgColor.value;
        backgroundImageData = '';
    }
});

instagramInput.addEventListener('input', updateSocialIcons);
weedmapsInput.addEventListener('input', updateSocialIcons);

// File input handlers
[dropZoneLogo, dropZoneBg].forEach(zone => {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        const input = zone.querySelector('input');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            input.files = files;
            handleFileSelect({ target: input });
        }
    });
    zone.addEventListener('click', () => zone.querySelector('input').click());
});

logoInput.addEventListener('change', handleFileSelect);
bgImage.addEventListener('change', handleFileSelect);

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            if (e.target === logoInput) {
                previewLogo.src = event.target.result;
                previewLogo.style.border = `2px solid ${fgColor.value}`;
                previewLogo.style.width = '100px'; // Ensure consistent size
                previewLogo.style.height = '100px';
            } else if (e.target === bgImage && bgToggle.checked) {
                previewPane.style.backgroundImage = `url(${event.target.result})`;
                previewPane.style.backgroundSize = 'cover';
                backgroundImageData = event.target.result;
            }
        };
        reader.readAsDataURL(file);
    }
}

function updateSocialIcons() {
    socialIcons.innerHTML = '';
    shopNowContainer.innerHTML = '';
    
    const instagramUsername = instagramInput.value.trim();
    if (instagramUsername) {
        const instagramLink = `https://instagram.com/${instagramUsername}`;
        socialIcons.innerHTML += `<div style="display: flex; justify-content: center;"><a href="${instagramLink}" target="_blank"><img src="${instagramIcon}" alt="Instagram"></a></div>`;
    }

    const weedmapsUrl = weedmapsInput.value.trim();
    if (weedmapsUrl) {
        shopNowContainer.innerHTML += `<div><a href="${weedmapsUrl}" target="_blank" class="shop-now-btn" style="background-color: ${buttonColor.value};">Shop Now</a></div>`;
    }
}

window.addLocation = function() {
    const locationsDiv = document.getElementById('locations');
    const locationGroups = document.getElementsByClassName('location-group');
    if (locationGroups.length >= 5) return;
    
    const newGroup = document.createElement('div');
    newGroup.className = 'location-group';
    
    newGroup.innerHTML = `
        <input type="text" class="location-input p-2 border rounded w-1/4" placeholder="Location">
        <input type="text" class="hours-input p-2 border rounded w-1/4" placeholder="Hours">
        <input type="text" class="phone-input p-2 border rounded w-1/4" placeholder="Phone">
        <button onclick="addLocation()" class="add-location bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-700">+</button>
    `;
    
    const existingButtons = document.querySelectorAll('.add-location');
    existingButtons[existingButtons.length - 1].remove();
    
    locationsDiv.appendChild(newGroup);
    updatePreview();
    
    newGroup.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', updatePreview);
    });
}

function updatePreview() {
    const locationGroups = document.getElementsByClassName('location-group');
    previewLocations.innerHTML = '';
    const cardWidth = 400 + (locationGroups.length - 1) * 120;
    cardPreview.style.width = `${cardWidth}px`;
    
    Array.from(locationGroups).forEach(group => {
        const location = group.querySelector('.location-input').value.trim();
        const hours = group.querySelector('.hours-input').value.trim();
        const phone = group.querySelector('.phone-input').value.trim();
        
        previewLocations.innerHTML += `
            <div class="flex-1 min-w-[100px] px-2 text-center">
                <p>Location: ${location || 'Your Location'}</p>
                <p>Hours: ${hours || 'Your Hours'}</p>
                <p>Phone: ${phone || 'Your Phone'}</p>
            </div>
        `;
    });
    if (!previewLocations.innerHTML) {
        previewLocations.innerHTML = `
            <div class="flex-1 text-center">
                <p>Location: Your Location</p>
                <p>Hours: Your Hours</p>
                <p>Phone: Your Phone</p>
            </div>
        `;
        cardPreview.style.width = '400px';
    }
}

window.generateCard = function() {
    const locationGroups = document.getElementsByClassName('location-group');
    let locationsHTML = '<div style="display: flex; justify-content: space-between;">';
    
    Array.from(locationGroups).forEach(group => {
        const location = group.querySelector('.location-input').value.trim();
        const hours = group.querySelector('.hours-input').value.trim();
        const phone = group.querySelector('.phone-input').value.trim();
        
        locationsHTML += `
            <div style="flex: 1; padding: 0 10px; text-align: center;">
                <p>Location: ${location || 'Your Location'}</p>
                <p>Hours: ${hours || 'Your Hours'}</p>
                <p>Phone: ${phone || 'Your Phone'}</p>
            </div>
        `;
    });
    locationsHTML += '</div>';

    const bgStyle = bgToggle.checked && backgroundImageData ?
        `background-image: url('${backgroundImageData}'); background-size: cover;` :
        `background-color: ${bgColor.value};`;

    const cardWidth = 400 + (locationGroups.length - 1) * 120;

    let socialHTML = '';
    const instagramUsername = instagramInput.value.trim();
    if (instagramUsername) {
        const instagramLink = `https://instagram.com/${instagramUsername}`;
        socialHTML += `<div style="display: flex; justify-content: center;"><a href="${instagramLink}" target="_blank"><img src="${instagramIcon}" style="width: 24px; height: 24px; margin: 0 5px;"></a></div>`;
    }

    const weedmapsUrl = weedmapsInput.value.trim();
    const weedmapsHTML = weedmapsUrl ? `<div><a href="${weedmapsUrl}" target="_blank" class="shop-now-btn" style="background-color: ${buttonColor.value};">Shop Now</a></div>` : '';

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
                    ${bgStyle}
                    background-size: cover;
                    background-position: center;
                }
                .business-card {
                    width: ${cardWidth}px;
                    padding: 20px;
                    border-radius: 10px;
                    color: ${fgColor.value};
                    background-color: ${cardColor.value};
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    position: relative;
                    max-width: 90%;
                }
                .business-card img.logo {
                    width: 100px;
                    height: 100px;
                    margin: 10px auto;
                    display: block;
                    border-radius: 50%;
                    border: 2px solid ${fgColor.value};
                    object-fit: cover;
                }
                .social-icons {
                    text-align: center;
                    margin-bottom: 10px;
                }
                .social-icons img {
                    width: 24px;
                    height: 24px;
                    margin: 0 5px;
                }
                .shop-now-btn {
                    padding: 10px 20px;
                    border-radius: 5px;
                    text-decoration: none;
                    color: white;
                    background-color: ${buttonColor.value};
                    display: block;
                    margin: 10px auto 0;
                    text-align: center;
                }
                h1 { 
                    margin: 10px 0; 
                    text-align: center;
                }
                .get-in-touch-btn {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background-color: #4285f4;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 50px;
                    text-decoration: none;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    z-index: 1000;
                }
                @media (max-width: 640px) {
                    .business-card {
                        width: 90%;
                    }
                }
            </style>
        </head>
        <body>
            <div class="business-card">
                <img src="${previewLogo.src}" class="logo" style="border: 2px solid ${fgColor.value};">
                <div class="social-icons">${socialHTML}</div>
                <h1>${businessNameInput.value || 'Your Business Name'}</h1>
                ${locationsHTML}
                ${weedmapsHTML}
            </div>
            <a href="https://calendly.com/your-scheduler" target="_blank" class="get-in-touch-btn">Get in Touch</a>
        </body>
        </html>
    `;

    const newWindow = window.open('');
    if (newWindow) {
        newWindow.document.write(cardHTML);
        newWindow.document.close();
    }
}

// Initial setup
previewPane.style.backgroundColor = bgColor.value;
cardPreview.style.color = fgColor.value;
cardPreview.style.backgroundColor = cardColor.value;
previewLogo.style.border = `2px solid ${fgColor.value}`;
previewLogo.style.width = '100px'; // Set initial size
previewLogo.style.height = '100px';
updatePreview();
updateSocialIcons();
document.querySelectorAll('.location-input, .hours-input, .phone-input')
    .forEach(input => input.addEventListener('input', updatePreview));