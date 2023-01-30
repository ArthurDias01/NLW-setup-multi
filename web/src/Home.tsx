import "./styles/global.css";
import { Header } from "./components/Header";
import { SummaryTable } from "./components/SummaryTable";
import "./lib/dayjs"
import toast from 'react-hot-toast';
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { parseCookies } from 'nookies';

export function Home() {
  const { user, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = () => {
      const token = parseCookies().token;
      if (!user && !isLoggingIn && !token) {
        toast.error('Você precisa estar logado para acessar essa página')
        navigate('/');
      }
    }
    return checkUser();
  }, [isLoggingIn])

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-full max-w-5xl px-6 flex flex-col gap-16">
        <Header />
        <SummaryTable />
      </div>
    </div>
  )
}
