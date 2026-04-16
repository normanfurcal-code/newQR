// Variables globales
let html5QrCode; // Para el escáner QR
let scanning = false; // Indica si la cámara está activa
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
  audio.play().catch(() => {});
};
// callback de escaneo
const onScan = (decodedText) => {
  if (scanned) return;
  scanned = true;

  activarSonido();
  procesarQR(decodedText);

  setTimeout(() => {
    cerrarCamara();
  }, 300);

// iniciar cámara
const encenderCamara = async () => { // async porque usa await: espera un resultado
  if (scanning) return; // Si ya está escaneando, no hace nada

  html5QrCode = new Html5Qrcode("reader"); // Inicializa el escáner en el div con id "reader"

  // ✅ Intento principal (iPhone + Android moderno)
    await html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 }, onScan
      
    );

    scanning = true;

  /*try { // Para capturar errores al iniciar la cámara o escanear
    const cameras = await Html5Qrcode.getCameras(); // Obtiene las cámaras del movil

    // Condicion para verificar si hay cámaras disponibles
    if (cameras && cameras.length) {

    // buscar cámara trasera
      const backCamera = cameras.find(camera => // Si no encuentra una camara llamada back
        camera.label.toLowerCase().includes("back") || // Tomaro otra camara que este disponible
        camera.label.toLowerCase().includes("rear") ||
        camera.label.toLowerCase().includes("environment")
      );

      // Elegir camara. Si hay una trasera, la usa, sino usa la primera disponible
      const cameraId = backCamera ? backCamera.id : cameras[0].id;

      // Iniciar el escáner con la cámara seleccionada
      await html5QrCode.start(
        cameraId, // Camara a usar
        {
          fps: 10, // Velocidad de escaneo (10 frames por segundo)
          qrbox: 250 // Tamaño del área de escaneo (250x250 píxeles)
        },
        (decodedText) => { // Función que se ejecuta cuando se detecta un código QR
          activarSonido(); // Reproduce el sonido de escaneo

          // Libreria swal para mostrar una alerta bonita con el texto del código QR detectado
          Swal.fire({
            title: "Código detectado",
            text: decodedText,
            icon: "success"
          });
          // apaga o desactiva el escaner despues de leer 
          cerrarCamara();
        }
    );*/

    // Pero indica que la camara esta encendida
      //scanning = true;
    }
  } catch (err) {  // Para capturar errores al iniciar la cámara o escanear
    console.error(err);
    alert("Error al iniciar la cámara");
  }
};

// detener o apagar la cámara
const cerrarCamara = async () => {
  if (!scanning) return; // Evitar errores: Si no esta activa no hace nada

  await html5QrCode.stop(); // Detiene la camara y el escáner
  await html5QrCode.clear(); // Limpia la interfaz del escáner

  scanning = false; // Actualiza el estado para indicar que la cámara está apagada
};

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
