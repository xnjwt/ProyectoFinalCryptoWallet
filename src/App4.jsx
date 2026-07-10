import { useState, useEffect } from "react";

import { ImportarSemilla } from "./components/ClaveSemilla/ImportarSemilla";
import { MenuWallet } from "./components/ClaveSemilla/MenuWallet";


function App() {
  const [user, setUser] = useState(null);
  return (
   <MenuWallet/>
  );
}

export default App;
