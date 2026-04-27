let html5QrCode;
let scanning = false;
let lastScan = 0;

// iniciar cámara
const encenderCamara = async () => {
  if (scanning) return;

  try {
    html5QrCode = new Html5Qrcode("reader");

    await html5QrCode.start(
      { facingMode: "environment" }, // 🔥 clave en iPhone
      {
        fps: 10,
        qrbox: 250
      },
      (decodedText) => {
        const now = Date.now();

        if (now - lastScan < 1500) return;
        lastScan = now;

        procesarQR(decodedText);
      }
    );

    scanning = true;

  } catch (err) {
    console.error(err);
    alert("Error cámara: " + err);
  }
};

// detener cámara
const cerrarCamara = async () => {
  if (!scanning) return;

  await html5QrCode.stop();
  await html5QrCode.clear();

  scanning = false;
};

// sonido
const activarSonido = () => {
  const audio = document.getElementById("audioScaner");
  audio?.play().catch(() => {});
};

// procesar QR
function procesarQR(texto) {

  activarSonido();

  Swal.fire({
    title: "QR leído",
    text: texto,
    icon: "success"
  });

  console.log("QR:", texto);
}

// eventos
document.getElementById("btn-start").addEventListener("click", encenderCamara);
document.getElementById("btn-stop").addEventListener("click", cerrarCamara);
