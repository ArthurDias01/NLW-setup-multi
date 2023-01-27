import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "phosphor-react";
import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";

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

  const { user } = useAuth();
  const [habitsInfo, setHabitsInfo] = useState<HabitInfo>();

  const isDayInPast = dayjs(date).endOf('day').isBefore(dayjs(), 'day');


  useEffect(() => {
    const getDay = async () => {
      const token = await user?.getIdToken();
      api.get('/day', {
        params: {
          date: date.toISOString(),
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(response => {
        setHabitsInfo(response.data)
      }).catch(error => {
        console.log(error)
      })
    }
    getDay();
  }, [])

  async function handleToggleHabit(habitId: string) {
    const token = await user?.getIdToken();
    await api.patch(`/habits/${habitId}/toggle`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const isHabitAlreadyComplete = habitsInfo!.completedHabits.includes(habitId);

    let completedHabits: string[] = [];

    if (isHabitAlreadyComplete) {
      completedHabits = habitsInfo!.completedHabits.filter(habit => habit !== habitId);
    } else {
      completedHabits = [...habitsInfo!.completedHabits, habitId];
    }
    setHabitsInfo({
      possibleHabits: habitsInfo!.possibleHabits,
      completedHabits,
    })
    onCompletedChanged(completedHabits.length);
  }

  return (
    <div className="mt-6 flex flex-col gap-3 ">
      {habitsInfo?.possibleHabits.map(habit => {
        return (
          (
            <Checkbox.Root key={habit.id} className="flex items-center gap-3 group focus:outline-none disabled:cursor-not-allowed"
              checked={habitsInfo.completedHabits.includes(habit.id)}
              disabled={isDayInPast}
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
        )
      })}
    </div>
  )
}
