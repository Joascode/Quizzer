import React, { FunctionComponent, Fragment, useState, useEffect } from 'react';
import { TeamModel } from './HostGame';
import Button from 'reactstrap/lib/Button';
import { TeamScores } from './TeamScores';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import { string } from 'prop-types';
import { QuizzDataHandler } from '../../shared/services/QuizzDataHandler';
import ButtonGroup from 'reactstrap/lib/ButtonGroup';

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
      <h1>End of Round #{props.roundNr}</h1>
      <ListGroup flush style={{ margin: '0 0 10px' }}>
        {props.teams.map((team, index) => {
          return (
            <ListGroupItem>
              <p>
                {index + 1}. {team.name}
              </p>
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
        <ButtonGroup block>
          <Button color="danger" onClick={() => props.stopPlaying()}>
            Stop playing
          </Button>
          <Button color="success" onClick={() => props.continuePlaying()}>
            Continue playing
          </Button>
        </ButtonGroup>
      </div>
    </Fragment>
  );
};
