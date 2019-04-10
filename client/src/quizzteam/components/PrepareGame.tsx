import React, { Fragment } from 'react';
import { GameInfoModel } from './TeamGame';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import Button from 'reactstrap/lib/Button';
import { TeamModel } from '../../quizzmaster/components/HostGame';

interface PrepareGameProps {
  teams: TeamModel[];
  leaveQuiz: () => void;
}

export const PrepareGame: React.FunctionComponent<PrepareGameProps> = (
  props,
) => {
  return (
    <Fragment>
      <h1>Waiting for teams</h1>
      <div style={{ flex: '1 1 auto' }}>
        <p>Teams</p>
        <ListGroup style={{ overflowY: 'auto' }} flush>
          {props.teams.map((team, index) => (
            <ListGroupItem key={index}>{team.name}</ListGroupItem>
          ))}
        </ListGroup>
      </div>
      <Button color="danger" onClick={() => props.leaveQuiz()} block>
        Leave Quiz
      </Button>
    </Fragment>
  );
};
