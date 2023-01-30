import dayjs from "dayjs";
import { prisma } from "../lib/cache";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { checkToken } from "./middleware/checktoken";
import { auth } from "../lib/firebase";
import { sendPasswordResetEmail } from 'firebase/auth'
import redis from "../lib/redis";

export async function appRoutes(app: FastifyInstance) {

  app.post('/register', async (request, response) => {
    // console.log('register', request.body);
    const createUserBody = z.object({
      email: z.string().email(),
      firebaseId: z.string(),
    });

    const { email, firebaseId } = createUserBody.parse(request.body);
    // console.log('email firebaseId', email, firebaseId);

    if (!email || !firebaseId) {
      return response.status(422).send({ error: 'Missing email or password' });
    }

    const user = await prisma.user.create({
      data: {
        firebaseId,
        email,
      }
    });

    return { user };
  });

  app.post('/checkuserexists', async (request, response) => {

    const checkUserExistsBody = z.object({
      email: z.string().email(),
      firebaseId: z.string(),
    });

    const { email, firebaseId } = checkUserExistsBody.parse(request.body);

    const user = await prisma.user.findUnique({
      where: {
        email,
      }
    });

    if (!user === undefined || user === null) {
      await prisma.user.create({
        data: {
          firebaseId,
          email,
        }
      })
    }


    return { user };
  });

  app.post("/habits", async (request, response) => {

    const { userId: user_id } = await checkToken(request, response);

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

    const parsedDate = dayjs(today).startOf("day");
    const cacheKey = `day:${parsedDate.format('DD/MM/YYYY')}:${user_id}`;

    await redis.del(cacheKey);
    await redis.del(`summary:${user_id}`);

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

    const cacheKey = `day:${parsedDate.format('DD/MM/YYYY')}:${user_id}`;
    const cachedDay = await redis.get(cacheKey);

    if (cachedDay) {
      return JSON.parse(cachedDay);
    }

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

    await redis.set(cacheKey, JSON.stringify({ possibleHabits, completedHabits }));

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

    await redis.del(`day:${dayjs().startOf("day").format('DD/MM/YYYY')}:${userId}`);
    await redis.del(`summary:${userId}`);
  });

  app.get("/summary", async (request, response) => {

    const { userId } = await checkToken(request, response);

    const cachedSummary = await redis.get(`summary:${userId}`);

    if (cachedSummary) {
      return JSON.parse(cachedSummary);
    } else {
      const summary = await prisma.$queryRaw`
              SELECT
                D.id,
                D.date,
                (
                    SELECT
                        cast(COUNT(*) as integer)
                    FROM day_habits DH
                    JOIN habits H
                        ON H.id = DH.habit_id
                    WHERE
                      DH.day_id = D.id
                      AND H.user_id = ${userId}
                ) as completed,
                (
                    SELECT
                       cast(COUNT(*) as integer)
                    FROM habit_week_days HWD
                    JOIN habits H
                        ON H.id = HWD.habit_id
                    WHERE
                        HWD.week_day = extract(dow from to_timestamp(date_part('epoch', D.date)::integer))
                        AND H.created_at <= D.date
                        AND H.user_id = ${userId}
                ) as amount
            FROM days D
          `

      await redis.set(`summary:${userId}`, JSON.stringify(summary), 'EX', 60 * 60 * 6);

      return summary;
    }
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
