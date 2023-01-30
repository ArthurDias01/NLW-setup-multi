import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./lib/axios";
import toast from "react-hot-toast";


export function ResetSenha() {

  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleChangeEmail = (e: any) => {
    setEmail(e.target.value)
  }

  const onSubmit = async (e: any) => {
    e.preventDefault();
    try {
      api.post('/resetpassword', {
        email
      })
      toast.success(`Email de reset de senha enviado com sucesso!`)
      navigate('/');
    } catch (error: any) {
      toast.error(error)
      // console.log(error)
    }
  }

  return (
    <div className="w-full max-w-md px-6 flex flex-col gap-16 items-center justify-center">
      <form className="w-full flex flex-col gap-8" onSubmit={onSubmit}>
        <h1 className="font-bold text-center w-full text-3xl">Esqueceu sua senha?</h1>
        <p className="text-center">Digite seu email para receber um link de reset de senha</p>
        <input type="text" placeholder="Email" className="p-4 rounded-lg  bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all duration-300"
          onChange={handleChangeEmail}
        />
        <button type="submit" className="p-4 rounded-lg bg-violet-500 text-white font-bold hover:bg-violet-600 transition-all duration-300">Enviar</button>
      </form>
    </div>
  )
}
