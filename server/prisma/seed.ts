import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const userId = '8133f8f8-7490-4d0f-9908-66c538b35b79';

const firstHabitId = '0730ffac-d039-4194-9571-01aa2aa0efbd'
const firstHabitCreationDate = new Date('2023-01-01T01:00:00.000')

const secondHabitId = '00880d75-a933-4fef-94ab-e05744435297'
const secondHabitCreationDate = new Date('2023-01-01T01:00:00.000')

const thirdHabitId = 'fa1a1bcf-3d87-4626-8c0d-d7fd1255ac00'
const thirdHabitCreationDate = new Date('2023-01-01T01:00:00.000')

async function run() {
  await prisma.habitWeekDays.deleteMany();
  await prisma.dayHabit.deleteMany();
  await prisma.day.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.user.deleteMany();

  await Promise.all([

    prisma.user.create({
      data: {
        id: userId,
        email: 'arthursantos01@gmail.com',
        firebaseId: 'FS9GSXSuqGMUZE5cZxgSmOhDYyU2',
        habits: {
          create: [
            {
              id: firstHabitId,
              title: 'Beber 2.5L água',
              created_at: firstHabitCreationDate,
              weekDays: {
                create: [
                  { week_day: 0, user: { connect: { id: userId } } },
                  { week_day: 1, user: { connect: { id: userId } } },
                  { week_day: 2, user: { connect: { id: userId } } },
                  { week_day: 3, user: { connect: { id: userId } } },
                  { week_day: 4, user: { connect: { id: userId } } },
                  { week_day: 5, user: { connect: { id: userId } } },
                  { week_day: 6, user: { connect: { id: userId } } },
                ],
              },
            },
            {
              id: secondHabitId,
              title: 'Fazer exercícios',
              created_at: secondHabitCreationDate,
              weekDays: {
                create: [
                  {
                    week_day: 1,
                    user: { connect: { id: userId } }
                  },
                  {
                    week_day: 2,
                    user: { connect: { id: userId } }
                  },
                  {
                    week_day: 4,
                    user: { connect: { id: userId } }
                  },
                  {
                    week_day: 5,
                    user: { connect: { id: userId } }
                  },
                ],
              },
            },
            {
              id: thirdHabitId,
              title: 'Dormir 7h',
              created_at: thirdHabitCreationDate,
              weekDays: {
                create: [
                  { week_day: 0, user: { connect: { id: userId } } },
                  { week_day: 1, user: { connect: { id: userId } } },
                  { week_day: 2, user: { connect: { id: userId } } },
                  { week_day: 3, user: { connect: { id: userId } } },
                  { week_day: 4, user: { connect: { id: userId } } },
                  { week_day: 5, user: { connect: { id: userId } } },
                  { week_day: 6, user: { connect: { id: userId } } },
                ]
              },
            }
          ],
        },
      },
    }),

  ])

  await Promise.all([

    prisma.day.create({
      data: {
        /** Monday */
        date: new Date('2023-01-23T06:00:00.000z'),
        dayHabits: {
          create: [
            { habit_id: firstHabitId },
            { habit_id: secondHabitId }, // Academia
            { habit_id: thirdHabitId }, // Dormir 7h
          ]
        }
      }
    }),

    prisma.day.create({
      data: {
        /** Tuesday */
        date: new Date('2023-01-24T06:00:00.000z'),
        dayHabits: {
          create: [
            { habit_id: firstHabitId }, // Beber Agua
            { habit_id: secondHabitId }, // Academia
          ]
        }
      }
    }),

  ])
}

run()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
