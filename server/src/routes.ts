import dayjs from "dayjs";
import { prisma } from "../lib/prisma";
import { FastifyInstance } from "fastify";
import { z } from "zod";


export async function appRoutes(app: FastifyInstance) {

  app.post("/habits", async (request) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)),
    });

    const { title, weekDays } = createHabitBody.parse(request.body);

    const today = dayjs().startOf("day").toDate();

    const habit = await prisma.habit.create({
      data: {
        title,
        weekDays: {
          create: weekDays.map(weekDay => {
            return {
              week_day: weekDay,
            }
          }),
        },
        createdAt: today,
      },
    });

    return { habit };
  });

  app.get("/day", async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date()
    });

    const { date } = getDayParams.parse(request.query);

    const parsedDate = dayjs(date).startOf("day");

    const weekDay = dayjs(date).get("day");

    const possibleHabits = await prisma.habit.findMany({
      where: {
        createdAt: {
          lte: date,
        },
        weekDays: {
          some: {
            week_day: weekDay,
          }
        },
      },
    });

    const day = await prisma.day.findUnique({
      where: {
        date: parsedDate.toDate(),
      },
      include: {
        dayHabits: true,
      }
    });

    const completedHabits: string[] | undefined = day?.dayHabits.map(dayHabit => {
      return dayHabit.habit_id;
    }) ?? [];

    return { possibleHabits, completedHabits };
  });

  app.patch("/habits/:id/toggle", async (request) => {
    const toggleHabitParams = z.object({
      id: z.string().uuid(),
    });

    const { id } = toggleHabitParams.parse(request.params);

    const today = dayjs().startOf("day").toDate();

    let day = await prisma.day.findUnique({
      where: {
        date: today,
      }
    });

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today,
        }
      });
    }

    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id,
        }
      }
    });

    //Completar Hábito
    if (!dayHabit) {
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id,
        }
      })
    } else {
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id,
        }
      })
    }

  });

  app.get("/summary", async (request) => {
    //FUNÇÔES SOMENTE DO SQLite<<
    // cast -> convertendo o tipo de dado de BigInt para Float
    //subquery -> subconsulta -> nome da variável volta depois do "as"

    const summary = await prisma.$queryRaw`
      SELECT
        D.id,
        D.date,
        (
          SELECT
            cast(COUNT(*) as float)
          FROM day_habits DH
          WHERE DH.day_id = D.id
        ) as completed,
        (
          SELECT
            cast(COUNT(*) as float)
          FROM habit_week_days HWD
          JOIN habits H
           ON H.id = HWD.habit_id
          WHERE
            HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
            AND H.createdAt <= D.date
        ) as amount
      FROM days D

    `
    return summary;
  });
}
