const express = require("express");
const cors = require("cors");

// 1. Nueva sintaxis modular: Importamos solo lo que necesitamos
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

// 2. Importamos tu llave privada (Asegúrate de que el nombre sea el correcto)
const serviceAccount = require("./firebase-service-account.json");

// 3. Inicializamos la aplicación
initializeApp({
  credential: cert(serviceAccount),
});

// 4. Creamos la instancia de la base de datos
const db = getFirestore();

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint básico
app.get("/", (req, res) => {
  res.json({ mensaje: "Servidor backend de la Wallet activo" });
});

// Endpoint de prueba para Firestore
app.post("/api/test-db", async (req, res) => {
  try {
    const docRef = await db.collection("USERS").add({
      email: "test@wallet.com",
      fechaRegistro: FieldValue.serverTimestamp(), // Usa la hora oficial del servidor de Google
      nota: "Si ves esto, el servidor tiene acceso a Firestore",
    });

    res.json({
      exito: true,
      mensaje: "Dato guardado correctamente",
      id_documento: docRef.id,
    });
  } catch (error) {
    console.error("Error conectando a Firestore:", error);
    res.status(500).json({ exito: false, error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
