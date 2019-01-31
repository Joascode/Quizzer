import React, { FunctionComponent, useState, Fragment } from 'react';
import Button from 'reactstrap/lib/Button';
import { Link } from 'react-router-dom';

interface ChangeTeamNameProps {
  teamName: string;
  changeName: (name: string) => void;
}

export const ChangeTeamName: FunctionComponent<ChangeTeamNameProps> = props => {
  const [newName, setNewName] = useState(props.teamName);

  return (
    <Fragment>
      <p>Change team name?</p>
      <label>
        Team name:{' '}
        <input value={newName} onChange={e => setNewName(e.target.value)} />
      </label>
      <Link to="/">
        <Button color="link">Leave Quiz</Button>
      </Link>
      <Button
        color="primary"
        disabled={newName === props.teamName}
        onClick={() => props.changeName(newName)}
      >
        Retry
      </Button>
    </Fragment>
  );
};
