const DEVELOPMENT = false;
const URL_DEVELOPMENT = "http://localhost/carnet-digital/server/moodle";
const URL_PRODUCTION = "https://centrovirtual.iespuertabonita.es";
const DATEURL_PRODUCTION = "https://digital.iespuertabonita.es";
const DEPARTMENTS = {
    IMS: "Imagen y sonido",
    ARG: "Artes gráficas",
    FOL: "Formación y orientación laboral",
    ORI: "Orientación",
    BAS: "Orientación (educación básica)",
    ING: "Inglés",
    PAS: "Personal de administración y servicios"
};

var baseUrl = DEVELOPMENT ? URL_DEVELOPMENT : URL_PRODUCTION;
var baseDateUrl = DEVELOPMENT ? URL_DEVELOPMENT : DATEURL_PRODUCTION;

async function getData(url) {
    let data;
    let options = {
        method: "POST",
        mode: "cors",
        cache: "default"
    };

    try {
        // Consultar al servidor y recuperar datos a partir de un json
        let response = await fetch(new Request(url, options));
        data = await response.json();
        
        // Unificar el formato de error cuando lo devuelve el servidor
        if (data.exception !== undefined) {
            data.error = data.message;
        }
    } catch (error) {
        // Capturar otro tipo de errores
        data = { error: error.message };
    }
    
    return data;
}

function closeSession() {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("password");
    window.location.href = "index.html";
}

function removeHTMLTags(str) {
    return str.replace(/<\/?[^>]+(>|$)/g, "");
}

function showError(error) {
    let feedback = document.getElementById("feedback");
    if (error !== undefined) {
        feedback.textContent = error;
    } else {
        feedback.textContent = "Unknown error";
    }
}
