import { Check } from "phosphor-react";
import * as Checkbox from '@radix-ui/react-checkbox';
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/axios";
import { parseCookies } from "nookies";

const availableWeekDays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export function NewHabitForm() {

  const [title, setTitle] = useState<string>('');
  const [weekDays, setWeekDays] = useState<number[]>([]);

  function handleToggleWeekDay(weekDayIndex: number) {
    if (weekDays.includes(weekDayIndex)) {
      setWeekDays(weekDays.filter(day => day !== weekDayIndex));
    } else {
      setWeekDays(prevState => [...prevState, weekDayIndex]);
    }
  }


  async function createNewHabit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title || weekDays.length === 0) return toast.error('Por favor, Preencha todos os campos');
    const token = parseCookies().token;

    console.log({ title, weekDays }, token !== '')
    try {
      await api.post('/habits', { title, weekDays }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      toast.success('Hábito criado com sucesso');
      setTitle('');
      setWeekDays([])
    } catch (error) {
      toast.error('Ocorreu um erro ao criar o hábito');
    }
  }

  return (
    <form onSubmit={createNewHabit} className="w-full flex flex-col mt-6">
      <label htmlFor="title" className="font-semibold leading-tight">
        Qual seu comprometimento?
      </label>
      <input
        type="text"
        id="title"
        placeholder="Ex: Exercícios,dormir bem, etc..."
        className="p-4 rounded-lg mt-3 bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-zinc-900"
        onChange={(e) => setTitle(e.target.value)}
        value={title}
        autoFocus
      />
      <label htmlFor="recorrência" className="font-semibold leading-tight mt-4">
        Qual a recorrência?
      </label>

      <div className="flex flex-col gap-2 mt-3 ">
        {
          availableWeekDays.map((day, index) => (
            <Checkbox.Root
              key={day}
              className="flex items-center gap-3 group transition-all focus:outline-none "
              onCheckedChange={() => handleToggleWeekDay(index)}
              checked={weekDays.includes(index)}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center focus:outline-none bg-zinc-900 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-400
                group-focus:ring-2 group-focus:ring-violet-500 group-focus:ring-opacity-50 group-focus:ring-offset-2 group-focus:ring-offset-zinc-900
                ">
                <Checkbox.CheckboxIndicator>
                  <Check size={20} className="text-white" />
                </Checkbox.CheckboxIndicator>
              </div>
              <span
                className="text-white font-semibold leading-tight ">
                {day}
              </span>
            </Checkbox.Root>
          ))
        }

      </div>

      <button type="submit" className="mt-6 rounded-lg p-4 flex items-center justify-center gap-3 font-semibold bg-green-600 hover:bg-green-500 transition-colors">
        <Check size={20} weight="bold" />
        Confirmar
      </button>


    </form>
  )
}
