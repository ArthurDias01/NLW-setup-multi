import dayjs from "dayjs";
import { prisma } from "../lib/prisma";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { checkToken } from "./middleware/checktoken";
import { auth } from "../lib/firebase";
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'


export async function appRoutes(app: FastifyInstance) {

  app.post('/register', async (request, response) => {
    const createUserBody = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const { email, password } = createUserBody.parse(request.body);

    if (!email || !password) {
      return response.status(422).send({ error: 'Missing email or password' });
    }

    const userCredentialFirebase = await createUserWithEmailAndPassword(auth, email, password);

    const user = await prisma.user.create({
      data: {
        email,
        firebaseId: userCredentialFirebase.user.uid,
      }
    });

    return { user };
  });

  app.post("/habits", async (request, response) => {
    const { userId: user_id } = await checkToken(request, response);

    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)),
      userId: z.string(),
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
              user: {
                connect: {
                  id: user_id,
                }
              },
            }
          }),
        },
        created_at: today,
        user_id,
      },
    });

    return { habit };
  });

  app.get("/day", async (request, response) => {

    const { userId: user_id } = await checkToken(request, response);

    const getDayParams = z.object({
      date: z.coerce.date(),
    });

    const { date } = getDayParams.parse(request.query);

    const parsedDate = dayjs(date).startOf("day");

    const weekDay = dayjs(date).get("day");

    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date,
        },
        weekDays: {
          some: {
            week_day: weekDay,
          }
        },
        user_id: {
          equals: user_id,
        }
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

  app.patch("/habits/:id/toggle", async (request, response) => {



    const { userId } = await checkToken(request, response);

    if (!userId) return response.status(401).send({ error: "Unauthorized" });

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
        },
      },
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

  app.get("/summary", async (request, response) => {
    response.header("Access-Control-Allow-Origin", "*");
    const { userId } = await checkToken(request, response);

    const summary = await prisma.$queryRaw`
    SELECT
                D.id,
                D.date,
                (
                    SELECT
                        cast(COUNT(*) as integer)
                    FROM day_habits DH
                    WHERE DH.day_id = D.id
                ) as completed,
                (
                    SELECT
                       cast(COUNT(*) as integer)
                    FROM habit_week_days HWD
                    JOIN habits H
                        ON H.id = HWD.habit_id
                    WHERE
                        HWD.week_day = date_part('dow', to_timestamp(extract(epoch from D.date) :: numeric / 1000.0))
                        AND H.created_at <= D.date
                        AND H.user_id = ${userId}
                ) as amount
            FROM days D
          `

    return summary;

  });

  app.post('/resetpassword', async (request, response) => {

    const resetEmailBody = z.object({
      email: z.string().email(),
    });

    const { email } = resetEmailBody.parse(request.body);

    if (!email) {
      return response.status(422).send({ error: 'Missing email' });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      }
    });

    if (!user) {
      return response.status(422).send({ error: 'User not found' });
    }

    try {
      await sendPasswordResetEmail(auth, user.email);
    } catch (error) {
      return response.status(422).send({ error: 'Error sending email' });
    }

    return { message: 'Email sent' };
  });
}
