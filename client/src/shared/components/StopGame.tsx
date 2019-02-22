import React, { FunctionComponent, Fragment } from 'react';
import { TeamModel } from '../../quizzmaster/components/HostGame';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import Button from 'reactstrap/lib/Button';

interface CloseGameProps {
  teams: TeamModel[];
  close: () => void;
}

export const StopGame: FunctionComponent<CloseGameProps> = (props) => {
  const renderListSortedOnHighestScore = () => {
    // Slice is quicker than concat for shallow copying of array. Spread operator and Object.assign are much slower.
    // https://stackoverflow.com/questions/9592740/how-can-you-sort-an-array-without-mutating-the-original-array
    const sortedTeams = props.teams.slice(0).sort((a, b) => b.score - a.score);
    return sortedTeams.map((team, index) => {
      return (
        <ListGroupItem key={index}>
          <p>{team.name}</p>
          <p>{team.score}</p>
        </ListGroupItem>
      );
    });
  };
  return (
    <Fragment>
      <p>End of the Quiz</p>
      <ListGroup>{renderListSortedOnHighestScore()}</ListGroup>
      <Button color="primary" block onClick={() => props.close()}>Close Quiz</Button>
    </Fragment>
  );
};
