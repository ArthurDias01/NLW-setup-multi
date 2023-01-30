import { HabitDay } from "./HabitDay";
import { generateDatesFromYearBeginning } from "../utils/generate-date-from-year-beginning";
import { api } from '../lib/axios';
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";
import { X } from "phosphor-react";
import { parseCookies } from "nookies";

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];
const summaryDates = generateDatesFromYearBeginning();

type ISummary = {
  date: Date;
  id: string;
  completed: number;
  amount: number;
}[];

export function SummaryTable() {

  const { user, signOut } = useAuth();
  const [summary, setSummary] = useState<ISummary>([]);



  useEffect(() => {
    const getSummary = async () => {

      const token = parseCookies().token;
      if (user) {
        api.get('/summary', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).then(response => {
          setSummary(response.data);
          // console.log('SUMMARY DATA', response.data)
        }).catch(error => {
          console.log(error)
        })
      }
    }
    getSummary();
  }, [user])


  const minimumSummaryDatesSize = 18 * 7;// 18 weeks
  const amountOfDatesToFill = minimumSummaryDatesSize - summaryDates.length;

  return (
    <div className="w-full flex flex-col justify-end items-end gap-8">
      {
        user && (
          <button
            type="button"
            className="w-fit border border-violet-500 font-semibold rounded-lg px-6 py-4 flex items-center gap-3 hover:border-violet-300 transition-colors
          focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-background mr-10
          "
            onClick={signOut}
          >
            <X size={20} className="text-violet-500" />
            Sair
          </button>
        )
      }
      <div className="w-full flex">
        <div className="grid grid-rows-7 grid-flow-row gap-3">
          {weekDays.map((day, index) => (
            <div key={index} className="text-zinc-400 text-xl font-bold h-10 w-10 flex items-center justify-center">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-rows-7 grid-flow-col gap-3">
          {summary.length > 0 && summaryDates.map(date => {
            const dayInSummary = summary?.find(day => dayjs(date).isSame(day.date, 'day'));

            // console.log('DAY IN SUMMARY', dayInSummary)

            return (
              <HabitDay key={date.toString()} date={date} defaultCompleted={dayInSummary?.completed} amount={dayInSummary?.amount} />
            )
          })}
          {
            amountOfDatesToFill > 0 && Array.from({ length: amountOfDatesToFill }).map((_, index: number) => (
              <div key={index} className="w-10 h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed" />
            ))
          }
        </div>
      </div>
    </div>
  )
}
