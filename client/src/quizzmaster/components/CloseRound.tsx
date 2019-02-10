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
  const [scoreAdded, isScoreAdded] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;
    setTimer(
      setTimeout(() => {
        if (mounted) isScoreAdded(true);
      }, 2000),
    );
    return () => {
      if (timer) clearTimeout(timer);
      mounted = false;
    };
  }, [props.roundNr]);

  return (
    <Fragment>
      <p>End of Round: {props.roundNr}</p>
      <ListGroup>
        {props.teams.map((team) => {
          return (
            <ListGroupItem>
              <p>{team.name}</p>
              {!scoreAdded ? (
                <p>{team.score - team.roundScore}</p>
              ) : (
                <p>{team.score}</p>
              )}
              {!scoreAdded ? <p>+ {team.roundScore}</p> : null}
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
