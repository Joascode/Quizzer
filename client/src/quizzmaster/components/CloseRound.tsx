import React, { FunctionComponent } from 'react';
import { TeamModel } from './HostGame';

interface CloseRoundProps {
  teams: TeamModel[];
  continuePlaying: () => void;
  stopPlaying: () => void;
}

export const CloseRound: FunctionComponent<CloseRoundProps> = props => {
  return <div>CloseRound!</div>;
};
