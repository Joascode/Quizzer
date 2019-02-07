import React, { FunctionComponent, Fragment, useState, useEffect } from 'react';
import { TeamModel } from './HostGame';
import Button from 'reactstrap/lib/Button';
import { TeamScores } from './TeamScores';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import { string } from 'prop-types';
import { QuizzDataHandler } from '../../shared/services/QuizzDataHandler';

interface CloseRoundProps {
  roundNr: number;
  teams: TeamModel[];
  continuePlaying: () => void;
  stopPlaying: () => void;
}

export const CloseRound: FunctionComponent<CloseRoundProps> = (props) => {
  // const [teamRoundScore, setTeamRoundScore] = useState<[{teamId: string, score: number}] | undefined>(undefined);

  // useEffect(() => {

  // })

  return (
    <Fragment>
      <p>End of round: {props.roundNr}</p>
      <ListGroup>
        {props.teams.map((team) => {
          return (
            <ListGroupItem>
              <p>{team.name}</p>
              <p>{team.score}</p>
              <p>+ {team.roundScore}</p>
            </ListGroupItem>
          );
        })}
      </ListGroup>
      <div>
        <Button color="success" onClick={() => props.continuePlaying()}>
          Continue playing
        </Button>
        <Button color="danger" onClick={() => props.stopPlaying()}>
          Stop playing
        </Button>
      </div>
    </Fragment>
  );
};
