-- DropForeignKey
ALTER TABLE "day_habits" DROP CONSTRAINT "day_habits_habit_id_fkey";

-- DropForeignKey
ALTER TABLE "habit_week_days" DROP CONSTRAINT "habit_week_days_habit_id_fkey";

-- DropForeignKey
ALTER TABLE "habit_week_days" DROP CONSTRAINT "habit_week_days_user_id_fkey";

-- DropForeignKey
ALTER TABLE "habits" DROP CONSTRAINT "habits_user_id_fkey";

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_week_days" ADD CONSTRAINT "habit_week_days_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_week_days" ADD CONSTRAINT "habit_week_days_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "day_habits" ADD CONSTRAINT "day_habits_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
