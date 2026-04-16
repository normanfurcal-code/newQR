// Variables globales
let html5QrCode; 
let scanning = false;
var qrData = [];
let qrMemory = JSON.parse(localStorage.getItem("qrMemory")) || [];
let url = "json/qr.json";

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

document.addEventListener("DOMContentLoaded", async () => {

  qrData = await getData(url);

  if (!Array.isArray(qrData)) {
    qrData = [];
  }

  console.log("Json cargado:", qrData);

  document.getElementById("btn-start").addEventListener("click", encenderCamara);
  document.getElementById("btn-stop").addEventListener("click", cerrarCamara);
});

// sonido
const activarSonido = () => {
  const audio = document.getElementById("audioScaner");
  if (audio) {
    audio.play().catch(() => {});
  }
};

// iniciar cámara
const encenderCamara = async () => {
  if (scanning) return;

  html5QrCode = new Html5Qrcode("reader");

  let procesando = false; // evita múltiples lecturas

  const onScan = (decodedText) => {
    if (procesando) return;
    procesando = true;

    activarSonido();
    procesarQR(decodedText);
    cerrarCamara();
  };

  try {
    // ✅ MÉTODO UNIVERSAL (funciona en iPhone y Android)
    await html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: 250
      },
      onScan
    );

    scanning = true;

  } catch (err) {
    console.warn("Fallback a selección de cámara:", err);

    try {
      // 🔁 fallback para Android/PC
      const cameras = await Html5Qrcode.getCameras();

      if (cameras && cameras.length) {
        const cameraId = cameras[0].id;

        await html5QrCode.start(
          cameraId,
          { fps: 10, qrbox: 250 },
          onScan
        );

        scanning = true;
      }

    } catch (error) {
      console.error(error);
      alert("No se pudo iniciar la cámara");
    }
  }
};

// detener cámara
const cerrarCamara = async () => {
  if (!scanning) return;

  if (html5QrCode) {
    await html5QrCode.stop();
    await html5QrCode.clear();
  }

  scanning = false;
};

// procesar QR
function procesarQR(decodedText) {

  const cleanQR = decodedText.trim();

  console.log("QR leído:", cleanQR);
  console.log("JSON:", qrData);

  const existeEnJSON = qrData.find(item =>
    item.code && item.code.trim() === cleanQR
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
