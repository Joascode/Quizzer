import React, { FunctionComponent } from 'react';
import { TeamModel } from './HostGame';

interface CloseGameProps {
  teams: TeamModel[];
  close: () => void;
}

export const CloseGame: FunctionComponent<CloseGameProps> = props => {
  return <div>CloseGame!</div>;
};
