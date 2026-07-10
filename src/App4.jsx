import { useState, useEffect } from "react";

import { ImportarSemilla } from "./components/ClaveSemilla/ImportarSemilla";
import { MenuWallet } from "./components/ClaveSemilla/MenuWallet";
import { Autenticacion } from "./components/Autenticacion/Autenticacion";
import { SeedPhraseVerification } from "./components/ClaveSemilla/SeedPhraseVerification";
import { SeedPhraseDisplay } from "./components/ClaveSemilla/SeedPhraseDisplay";
import { VerificarFrase } from "./components/ClaveSemilla/VerificarFrase";
import {GenerarFraseSemilla} from "./components/ClaveSemilla/GenerarFraseSemilla";


function App4() {
  const [user, setUser] = useState(null);
  return (
   <Autenticacion/>
  );
}

export default App4;
