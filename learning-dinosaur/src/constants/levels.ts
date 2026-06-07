export interface LevelInfo {
  minXp: number;
  name: string;
  icon: string;
}

export const LEVELS: LevelInfo[] = [
  {
    minXp: 0,
    name: 'Trứng Khủng Long',
    icon: '🥚',
  },
  {
    minXp: 100,
    name: 'Khủng Long Bột',
    icon: '🦎',
  },
  {
    minXp: 300,
    name: 'Khủng Long Học Việc',
    icon: '🦕',
  },
  {
    minXp: 700,
    name: 'T-Rex Mê Học',
    icon: '🦖',
  },
  {
    minXp: 1500,
    name: 'Khủng Long Thông Thái',
    icon: '🐉',
  },
  {
    minXp: 3000,
    name: 'Khủng Long Bất Tử',
    icon: '☄️',
  },
];
