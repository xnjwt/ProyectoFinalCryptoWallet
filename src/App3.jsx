import { useState, useEffect } from "react";
/*import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./FirebaseConfig";
import { FormularioAcceso } from "./components/FormularioAcceso";
import { Dashboard } from "./components/dashboard/WalletDashboard";
import { useWalletStore } from "./store/walletStore";
import { GenerarFraseSemilla } from "./components/ClaveSemilla/GenerarFraseSemilla";
import { SeedPhraseVerification } from "./components/ClaveSemilla/SeedPhraseVerification";
import { ReceiveForm } from "./components/recibirCrypto/ReceiveForm";
import { VerificarFrase } from "./components/ClaveSemilla/VerificarFrase";
import { Autenticacion } from "./components/Autenticacion/Autenticacion";
import { Configuracion } from "./components/dashboard/Configuracion"; */
//import RecibirCrypto from "./components/recibirCrypto/RecibirCripto";
import { EnviarCrypto } from "./components/EnviarCrypto/EnviarCrypto";


function App3() {
  const [user, setUser] = useState(null);
  return (
   <EnviarCrypto/>
  );
}

export default App3;
