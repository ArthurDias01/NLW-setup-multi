import "./styles/global.css";
import { Header } from "./components/Header";
import { LoginForm } from "./components/LoginForm";



export function Login() {


  return (
    <div className="w-full max-w-md px-6 flex flex-col gap-16 items-center justify-center">
      <Header />
      <LoginForm />
    </div>
  )
}
