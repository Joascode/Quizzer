import React, { FunctionComponent, Fragment } from 'react';
import { TeamModel } from '../../quizzmaster/components/HostGame';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import Button from 'reactstrap/lib/Button';
import { IoMdTrophy } from 'react-icons/io';

interface CloseGameProps {
  teams: TeamModel[];
  close: () => void;
}

export const StopGame: FunctionComponent<CloseGameProps> = (props) => {
  const showThrophy = (index: number) => {
    let throphyColor;
    let throphySize;

    switch (index) {
      case 0:
        throphyColor = 'gold';
        throphySize = '3em';
        break;
      case 1:
        throphyColor = 'silver';
        throphySize = '2.5em';
        break;
      case 2:
        throphyColor = 'bronze';
        throphySize = '2em';
        break;
      default:
        throphyColor = 'transparant';
        break;
    }

    return (
      <IoMdTrophy
        style={{
          color: throphyColor,
          position: 'absolute',
          fontSize: throphySize,
          left: 0,
        }}
      />
    );
  };

  const renderListSortedOnHighestScore = () => {
    // Slice is quicker than concat for shallow copying of array. Spread operator and Object.assign are much slower.
    // https://stackoverflow.com/questions/9592740/how-can-you-sort-an-array-without-mutating-the-original-array
    const sortedTeams = props.teams.slice(0).sort((a, b) => b.score - a.score);
    return sortedTeams.map((team, index) => {
      return (
        <ListGroupItem key={index} style={{ position: 'relative' }}>
          {index <= 3 ? showThrophy(index) : null}
          <p>
            {index + 1}. {team.name}
          </p>
          <p>{team.score}</p>
        </ListGroupItem>
      );
    });
  };
  return (
    <Fragment>
      <p>End of the Quizz</p>
      <ListGroup flush>{renderListSortedOnHighestScore()}</ListGroup>
      <Button color="primary" block onClick={() => props.close()}>
        Close Quiz
      </Button>
    </Fragment>
  );
};
