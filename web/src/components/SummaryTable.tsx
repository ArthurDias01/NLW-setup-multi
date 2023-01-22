import { HabitDay } from "./HabitDay";
import { generateDatesFromYearBeginning } from "../utils/generate-date-from-year-beginning";
import { api } from '../lib/axios';
import { useEffect, useState } from "react";
import dayjs from "dayjs";

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];
const summaryDates = generateDatesFromYearBeginning();

type ISummary = {
  date: Date;
  id: string;
  completed: number;
  amount: number;
}[];

export function SummaryTable() {
  const [summary, setSummary] = useState<ISummary>([]);


  useEffect(() => {
    api.get('/summary').then(response => {
      setSummary(response.data);
    })
  }, [])


  const minimumSummaryDatesSize = 18 * 7;// 18 weeks
  const amountOfDatesToFill = minimumSummaryDatesSize - summaryDates.length;

  return (
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
  )
}
