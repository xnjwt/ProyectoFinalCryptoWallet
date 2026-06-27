/* eslint-disable */
const express = require("express");
const cors = require("cors");

// Importaciones de Firebase
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const serviceAccount = require("./firebase-service-account.json");

// Inicialización de la base de datos
initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore();

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint básico de estado
app.get("/", (req, res) => {
  res.json({ mensaje: "Servidor backend de la Wallet activo" });
});

// --- Endpoint Oficial: Vincular Wallet al Usuario ---
app.post("/api/users/link-wallet", async (req, res) => {
  // 1. Recepción de datos del frontend
  const { uid, email, publicKey } = req.body;

  // 2. Validación de seguridad
  if (!uid || !publicKey) {
    return res.status(400).json({
      exito: false,
      error:
        "Faltan datos obligatorios: Se requiere el UID de Firebase y la Clave Pública de Solana.",
    });
  }

  try {
    // 3. Escritura en la base de datos (Usando el UID como nombre del documento)
    await db
      .collection("USERS")
      .doc(uid)
      .set(
        {
          email: email || "Sin correo",
          publicKey: publicKey,
          fechaRegistro: FieldValue.serverTimestamp(),
          estado: "activo",
        },
        { merge: true },
      );

    // 4. Respuesta de éxito al frontend
    res.json({
      exito: true,
      mensaje: "Wallet vinculada correctamente al perfil del usuario.",
    });
  } catch (error) {
    // 5. Manejo de errores
    console.error("Error al vincular la wallet:", error);
    res.status(500).json({ exito: false, error: error.message });
  }
});

// Encendido del servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
