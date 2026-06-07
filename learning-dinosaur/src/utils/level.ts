import { LEVELS, LevelInfo } from '../constants/levels';

export function getLevelByXp(xp: number = 0): LevelInfo {
  let currentLevel = LEVELS[0];

  for (const level of LEVELS) {
    if (xp >= level.minXp) {
      currentLevel = level;
    }
  }

  return currentLevel;
}
