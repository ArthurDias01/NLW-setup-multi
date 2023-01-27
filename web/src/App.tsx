import "./styles/global.css";
import "./lib/dayjs"
import { Toaster } from 'react-hot-toast';
import { Login } from "./Login";
import { Home } from "./Home";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import { ResetSenha } from "./ResetSenha";

export function App() {
  return (

    <Router>
      <AuthProvider>
        <div className="w-screen h-screen flex justify-center items-center">
          <Toaster position="top-center" />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/resetsenha" element={<ResetSenha />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

// (
//   <Router>
//   <div className="pt-20">
//     <Navbar />
//
//   </div>
//   </Router>
// )
