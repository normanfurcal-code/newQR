// Variables globales
let html5QrCode;
let scanning = false;
let closing = false;
let scanned = false;

let qrMemory = JSON.parse(localStorage.getItem("qrMemory")) || [];
let url = "json/qr.json";
let qrData = [];

// ========================
// Cargar JSON
// ========================
async function getData(url) {
  try {
    let response = await fetch(url, {
      method: "GET",
      cache: "no-cache"
    });

    return await response.json();

  } catch (error) {
    console.error(error);
    return [];
  }
}

// ========================
// INIT
// ========================
document.addEventListener("DOMContentLoaded", async () => {

  qrData = await getData(url);

  if (!Array.isArray(qrData)) {
    qrData = [];
  }

  console.log("Json cargado:", qrData);

  document.getElementById("btn-start").addEventListener("click", encenderCamara);
  document.getElementById("btn-stop").addEventListener("click", cerrarCamara);
});

// ========================
// SONIDO
// ========================
const activarSonido = () => {
  const audio = document.getElementById("audioScaner");
  audio.play().catch(() => {});
};

// ========================
// CALLBACK SCAN (🔥 CLAVE)
// ========================
const onScan = (decodedText) => {
  if (scanned) return;
  scanned = true;

  activarSonido();
  procesarQR(decodedText);

  setTimeout(() => {
    cerrarCamara();
  }, 300);
};

// ========================
// ENCENDER CÁMARA
// ========================
const encenderCamara = async () => {
  if (scanning) return;

  html5QrCode = new Html5Qrcode("reader");

  try {
    // ✅ Intento principal (iPhone + Android moderno)
    await html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      onScan
    );

    scanning = true;

  } catch (err) {
    console.warn("Fallback a cámaras:", err);

    try {
      // ✅ Fallback (Android antiguos / PC)
      const cameras = await Html5Qrcode.getCameras();

      if (!cameras.length) {
        throw new Error("No hay cámaras disponibles");
      }

      const backCamera = cameras.find(camera =>
        camera.label.toLowerCase().includes("back") ||
        camera.label.toLowerCase().includes("rear") ||
        camera.label.toLowerCase().includes("environment")
      );

      const cameraId = backCamera ? backCamera.id : cameras[0].id;

      await html5QrCode.start(
        cameraId,
        { fps: 10, qrbox: 250 },
        onScan
      );

      scanning = true;

    } catch (err2) {
      console.error(err2);
      alert("Error al iniciar la cámara");
    }
  }
};

encenderCamara = async () => {
  if (scanning) return;

  html5QrCode = new Html5Qrcode("reader");

  try {
    const cameras = await Html5Qrcode.getCameras();
    // ✅ Intento principal (iPhone + Android moderno)
    await html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      onScan, cameras
    );

    scanning = true;

  } catch (err) {
    console.warn("Fallback a cámaras:", err);

    /*try {
      // ✅ Fallback (Android antiguos / PC)
      const cameras = await Html5Qrcode.getCameras();

      if (!cameras.length) {
        throw new Error("No hay cámaras disponibles");
      }

      const backCamera = cameras.find(camera =>
        camera.label.toLowerCase().includes("back") ||
        camera.label.toLowerCase().includes("rear") ||
        camera.label.toLowerCase().includes("environment")
      );

      const cameraId = backCamera ? backCamera.id : cameras[0].id;

      await html5QrCode.start(
        cameraId,
        { fps: 10, qrbox: 250 },
        onScan
      );

      scanning = true;

    } catch (err2) {
      console.error(err2);
      alert("Error al iniciar la cámara");
    }*/
  }
};

// ========================
// CERRAR CÁMARA
// ========================
const cerrarCamara = async () => {
  if (!scanning || closing) return;

  closing = true;

  try {
    await html5QrCode.stop();
  } catch (err) {
    console.warn("Error al detener cámara:", err);
  }

  scanning = false;
  closing = false;
  scanned = false; // 🔥 permitir nuevo escaneo
};

// ========================
// VALIDACIÓN QR
// ========================
function procesarQR(decodedText) {

  const cleanQR = decodedText.trim(); // 👈 CLAVE

  console.log("QR leído:", cleanQR);
  console.log("JSON:", qrData);

  const existeEnJSON = qrData.find(item => 
    item.code.trim() === cleanQR
  );

  if (!existeEnJSON) {
    Swal.fire({
      title: "No válido",
      text: "El QR no existe en el sistema",
      icon: "error"
    });
    return;
  }

  const yaEnMemoria = qrMemory.includes(cleanQR);

  if (yaEnMemoria) {
    Swal.fire({
      title: "Ya registrado",
      text: "Este QR ya fue escaneado antes",
      icon: "warning"
    });
    return;
  }

  qrMemory.push(cleanQR);
  localStorage.setItem("qrMemory", JSON.stringify(qrMemory));

  Swal.fire({
    title: "OK",
    text: "QR válido y guardado",
    icon: "success"
  });

  console.log("Memoria:", qrMemory);
  console.log("RAW:", decodedText);
  console.log("LENGTH:", decodedText.length);
}
