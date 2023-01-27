import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast'

export function LoginForm() {


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, isLoggingIn, signInWithEmail, signUpWithEmail } = useAuth();
  const [newAccount, setNewAccount] = useState(false);

  const navigate = useNavigate();

  console.log(user, isLoggingIn)

  const handleChangeEmail = (e: any) => {
    setEmail(e.target.value)
  }

  const handleChangePassword = (e: any) => {
    setPassword(e.target.value)
  }

  const onSubmit = async (e: any) => {
    e.preventDefault();
    console.log('submit', email, password)
    try {
      await signInWithEmail({ email, password });
      toast.success(`Login realizado com sucesso! Bem vindo(a) ${email}`)
      navigate('/home');
    } catch (error) {
      toast.error('Erro ao realizar login')
      console.log(error)
    }
  }

  const onSubmitCreateAccount = async (e: any) => {
    e.preventDefault();
    try {
      await signUpWithEmail({ email, password });
      toast.success(`Conta criada com sucesso! Bem vindo(a) ${user!.email}`)
      navigate('/home');
    } catch (error) {
      toast.error('Erro ao realizar login')
      console.log(error)
    }
  }


  return (
    <>
      {
        !newAccount ?

          (
            <form className="w-full flex flex-col gap-8" onSubmit={onSubmit}>
              <h1 className="font-bold text-center w-full text-3xl">Login</h1>
              <input type="text" placeholder="Email" className="p-4 rounded-lg  bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all duration-300"
                onChange={handleChangeEmail}
              />
              <input type="password" placeholder="Senha" className="p-4 rounded-lg  bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all duration-300"
                onChange={handleChangePassword}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSubmit(e)
                  }
                }}
              />

              <div className="flex flex-row justify-between">Ainda não possui conta?
                <button className="font-semibold text-violet-700 underline" onClick={() => setNewAccount(true)}>Registre-se</button>
              </div>

              <button className="font-semibold text-violet-700 underline" onClick={() => navigate('/resetsenha')}>Esqueceu sua senha?</button>
              <button type="submit" className="mt-6 rounded-lg p-4 flex items-center justify-center gap-3 font-semibold bg-green-600 hover:bg-green-500 transition-colors" disabled={false}>
                {isLoggingIn ? 'Carregando...' : 'Entrar'}
              </button>
            </form>
          )

          :

          (
            <form className="w-full flex flex-col gap-8" onSubmit={onSubmitCreateAccount}>
              <h1 className="font-bold text-center w-full text-3xl">Registre-se</h1>
              <input type="text" placeholder="Email" className="p-4 rounded-lg  bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-zinc-900"
                onChange={handleChangeEmail}
              />
              <input type="password" placeholder="Senha" className="p-4 rounded-lg  bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-zinc-900"
                onChange={handleChangePassword}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSubmitCreateAccount(e)
                  }
                }}
              />
              <button className="font-semibold text-violet-700 underline" onClick={() => setNewAccount(false)}>Fazer Login</button>
              <button type="submit" className="mt-6 rounded-lg p-4 flex items-center justify-center gap-3 font-semibold bg-green-600 hover:bg-green-500 transition-colors" disabled={false}
              >
                {isLoggingIn ? 'Carregando...' : 'Registrar'}
              </button>
            </form>
          )
      }
    </>
  )
}
