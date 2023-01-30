import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "phosphor-react";
import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";
import { parseCookies } from "nookies";
import { toast } from "react-hot-toast";
interface Props {
  date: Date;
  onCompletedChanged: (completed: number) => void;
}

interface HabitInfo {
  possibleHabits: {
    id: string;
    title: string;
    created_at: string;
  }[],
  completedHabits: string[],
}

export function HabitsList({ date, onCompletedChanged }: Props) {

  const [habitsInfo, setHabitsInfo] = useState<HabitInfo>();
  const isDayInPast = dayjs(date).endOf('day').isBefore(dayjs(), 'day');
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [loadingDay, setLoadingDay] = useState(false);

  useEffect(() => {
    const getDay = async () => {
      setLoadingDay(true);
      const token = parseCookies().token;
      if (token) {
        api.get('/day', {
          params: {
            date: date.toISOString(),
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }).then(response => {
          setHabitsInfo(response.data)
          // console.log('DAY INFO', response.data)
        }).catch(error => {
          console.log(error)
        }).finally(() => {
          setLoadingDay(false);
        })
      } else {
        toast.error('Token não encontrado');
        // console.log('Token not found')
      }
    }
    getDay();
  }, [])

  async function handleToggleHabit(habitId: string) {


    const token = parseCookies().token;

    setLoadingToggle(true);

    try {
      await api.patch(`/habits/${habitId}/toggle`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      toast.success('Hábito atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar hábito');
      console.log(error)
    } finally {
      setLoadingToggle(false);
      const isHabitAlreadyComplete = habitsInfo!.completedHabits.includes(habitId);

      let completedHabits: string[] = [];

      if (isHabitAlreadyComplete) {
        completedHabits = habitsInfo!.completedHabits.filter(habit => habit !== habitId);
      } else {
        completedHabits = [...habitsInfo!.completedHabits, habitId];
      }
      onCompletedChanged(completedHabits.length);
      setHabitsInfo({
        possibleHabits: habitsInfo!.possibleHabits,
        completedHabits,
      })
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-3 ">
      {!loadingToggle && !loadingDay && habitsInfo?.possibleHabits.map(habit => {

        return (
          <Checkbox.Root key={habit.id}
            className="flex items-center gap-3 group focus:outline-none disabled:cursor-not-allowed"
            checked={habitsInfo.completedHabits.includes(habit.id)}
            disabled={isDayInPast || loadingToggle}
            onCheckedChange={() => handleToggleHabit(habit.id)}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-400
                group-focus:ring-2 group-focus:ring-violet-500 group-focus:ring-opacity-50 group-focus:ring-offset-2 group-focus:ring-offset-background
                ">
              <Checkbox.CheckboxIndicator>
                <Check size={20} className="text-white" />
              </Checkbox.CheckboxIndicator>
            </div>
            <span
              className="font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400">
              {habit.title}
            </span>
          </Checkbox.Root>
        )
      })}
      {
        loadingDay && (
          <ul className="list-none pl-6 mt-4 space-y-2">
            {[1, 2, 3].map((_, index) => (
              <li key={index}>
                <span className="inline-block h-5 animate-pulse bg-zinc-700 rounded w-[90%] -ml-4"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    animationDuration: '1s'
                  }}
                />
              </li>
            ))}
          </ul>
        )
      }
    </div>
  )
}
