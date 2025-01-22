import { countries } from '../data/countries.js';

// Variables globales
let selectedType = 'link';

// Función para inicializar el selector de países
function initCountrySelector() {
    const countrySelector = document.getElementById('country');
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = `${country.name} (${country.code})`;
        countrySelector.appendChild(option);
    });
}

// Función para seleccionar el tipo de dato
window.selectType = function (type) {
    selectedType = type;
    const input = document.getElementById('text');
    const inputIcon = document.getElementById('inputIcon');
    const country = document.getElementById('country');

    input.value = '';
    country.classList.add('d-none');

    const placeholders = {
        link: "Ingresa el enlace",
        phone: "Ingresa el número de teléfono",
        whatsapp: "Ingresa el número de WhatsApp (sin código de país)",
        email: "Ingresa el correo electrónico",
        social: "Ingresa el enlace de tu red social"
    };
    const icons = {
        link: "bi-link-45deg",
        phone: "bi-telephone-fill",
        whatsapp: "bi-whatsapp",
        email: "bi-envelope-fill",
        social: "bi-share-fill"
    };

    if (type === 'phone' || type === 'whatsapp') {
        country.classList.remove('d-none');
    }

    input.placeholder = placeholders[type];
    inputIcon.innerHTML = `<i class="bi ${icons[type]}"></i>`;
};

// Función para generar el código QR
window.generateQR = function () {
    const qrContainer = document.getElementById('qrcode');
    const downloadBtn = document.getElementById('downloadBtn');
    const input = document.getElementById('text').value.trim();
    const countryCode = document.getElementById('country').value;
    let qrData = input;

    qrContainer.innerHTML = '';
    downloadBtn.classList.add('d-none');

    if (!input) {
        alert("Por favor, completa el campo.");
        return;
    }

    // Formato especial para WhatsApp
    if (selectedType === 'whatsapp') {
        qrData = `whatsapp://send?phone=${countryCode}${input}`;
    } else if (selectedType === 'phone') {
        qrData = `tel:${countryCode}${input}`;
    }

    new QRCode(qrContainer, {
        text: qrData,
        width: 200,
        height: 200
    });

    setTimeout(() => downloadBtn.classList.remove('d-none'), 100);
};

// Función para descargar el QR
window.downloadQR = function () {
    const qrCanvas = document.querySelector('#qrcode canvas');
    const input = document.getElementById('text').value.trim();

    if (qrCanvas) {
        const safeText = input.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const link = document.createElement('a');
        link.href = qrCanvas.toDataURL('image/png');
        link.download = `${safeText || 'codigo-qr'}_Sur-Digital.png`;
        link.click();
    } else {
        alert("Primero genera un código QR.");
    }
};

// Inicializar
window.onload = function () {
    document.getElementById('year').textContent = new Date().getFullYear();
    initCountrySelector();
};