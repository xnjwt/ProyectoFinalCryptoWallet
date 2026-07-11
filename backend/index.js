/* eslint-disable */
const express = require("express");
const cors = require("cors");
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

//Guardar los datos del usuario
app.post("/api/users/link-wallet", async (req, res) => {
  try {
    const { uid, correo, username } = req.body;
    // Utilizamos el UID de Firebase como el ID del documento para mantener la sincronía
    await db.collection("USERS").doc(uid).set({
      correo,
      username,
      fechaCreacion: new Date().toString(),
    });
    res
      .status(200)
      .json({ mensaje: "Billetera vinculada y usuario registrado con éxito" });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al crear el usuario" });
  }
});

// Verificar unicidad del Username
app.get("/api/users/check-username/:username", async (req, res) => {
  try {
    const { username } = req.params;
    // Mecanismo: Búsqueda por igualdad en atributos secundarios
    const snapshot = await db
      .collection("USERS")
      .where("username", "==", username)
      .limit(1)
      .get();
    // snapshot.empty devuelve true si no hay coincidencias
    res.status(200).json({ existe: !snapshot.empty });
  } catch (error) {
    console.error("Error al verificar username:", error);
    res.status(500).json({ error: "Error al consultar la base de datos" });
  }
});

//Busqueda inversa para login, obtener el correo mediante el username
app.get("/api/users/get-email/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const snapshot = await db
      .collection("USERS")
      .where("username", "==", username)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Extraemos el primer (y único) documento encontrado y obtenemos su campo 'correo'
    const userData = snapshot.docs[0].data();
    res.status(200).json({ correo: userData.correo });
  } catch (error) {
    console.error("Error al obtener correo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
