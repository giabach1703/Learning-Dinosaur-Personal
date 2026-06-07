import React from 'react';
import { Tag } from 'antd';
import { getLevelByXp } from '../../utils/level';

interface LevelBadgeProps {
  xp: number;
}

const LevelBadge: React.FC<LevelBadgeProps> = ({ xp = 0 }) => {
  const level = getLevelByXp(xp);

  return (
    <Tag color="green">
      {level.icon} {level.name} · {xp} XP
    </Tag>
  );
};

export default LevelBadge;
