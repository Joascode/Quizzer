import React, { FunctionComponent, Fragment } from 'react';
import { TeamModel } from './HostGame';
import Button from 'reactstrap/lib/Button';

interface PrepareQuizProps {
  teams: TeamModel[];
  addTeam: (team: any) => void;
  startQuiz: () => void;
  removeTeam: (team: any) => void;
}

export const PrepareQuiz: FunctionComponent<PrepareQuizProps> = props => {
  return (
    <Fragment>
      <div>PrepareQuiz!</div>
      <ul>
        {props.teams.map((team, index) => {
          return (
            <li key={index}>
              {team.name}{' '}
              <Button onClick={() => props.removeTeam(team)}>X</Button>
            </li>
          );
        })}
      </ul>
      {props.teams.length > 1 ? (
        <Button onClick={() => props.startQuiz()}>Start!</Button>
      ) : null}
    </Fragment>
  );
};
