/* eslint-disable */
const express = require("express");
const cors = require("cors");
// La forma correcta para v14.x
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("./firebase-service-account.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const app = express();

app.use(cors());
app.use(express.json());

// RUTA PARA GUARDAR LA WALLET
app.post("/api/users/link-wallet", async (req, res) => {
  try {
    // Ajustamos las variables para que coincidan con el JSON del frontend
    const { uid, correo, llavePublica } = req.body;

    await db.collection("USERS").doc(uid).set({
      email: correo,
      publicKey: llavePublica, // Aseguramos que guardamos el dato correcto
      createdAt: new Date(),
    });

    res.json({ exito: true });
  } catch (error) {
    console.error("Error en servidor:", error);
    res.status(500).json({ error: error.message });
  }
});

// RUTA PARA OBTENER LA WALLET
app.get("/api/users/:uid", async (req, res) => {
  try {
    const doc = await db.collection("USERS").doc(req.params.uid).get();
    if (!doc.exists) return res.status(404).json({ error: "No encontrado" });
    res.json(doc.data());
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
