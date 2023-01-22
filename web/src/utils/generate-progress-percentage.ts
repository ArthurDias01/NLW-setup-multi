interface Props {
  total: number;
  completed: number;
}
export function generateProgressPercentage({ total, completed }: Props): number {
  return Math.round((completed / total) * 100);
}
