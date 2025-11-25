export const BASE_POINTS = 1000;
export const MAX_BONUS = 500;
export const TOTAL_TIME = 20;

export function calculateScore(isCorrect: boolean, timeLeft: number) {
  if (!isCorrect) return 0;
  const ratio = Math.min(timeLeft / TOTAL_TIME, 1);
  const bonus = Math.floor(MAX_BONUS * ratio);
  return BASE_POINTS + bonus;
}

export function applyScoreToPlayer(
  player: any,
  isCorrect: boolean,
  timeLeft: number
) {
  let points = 0;

  if (isCorrect) {
    points = 100 + Math.floor(timeLeft * 5); // example scoring formula
    player.score = (player.score || 0) + points;
  }

  return { points, isCorrect };
}
