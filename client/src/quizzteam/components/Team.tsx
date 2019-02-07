import React, { useState, Fragment, FunctionComponent } from 'react';
import { CreateTeam } from './CreateTeam';
import { ShowRooms } from './ShowRooms';
import { TeamGame } from './TeamGame';
import Button from 'reactstrap/lib/Button';
import { Link } from 'react-router-dom';

export interface Team {
  name: string;
  members: string[];
}

export interface CreateTeamModel {
  team: Team;
  createTeam: CreateTeamFunc;
  changeTeam: ChangeTeamFunc;
  updateTeam: { (team: Team): void };
}

export interface CreateTeamFunc {
  (team: Team): void;
}

export interface ChangeTeamFunc {
  (change: boolean): void;
}

enum TeamGameState {
  createTeam,
  teamCreated,
  roomJoined,
}

interface TeamProps {
  onError: (reason: string) => void;
}

// export const MyContext = React.createContext<CreateTeamModel>({
//   team: { name: '', members: [] },
//   createTeam: team => team,
//   changeTeam: () => {},
//   updateTeam: () => {},
// });

export const Team: FunctionComponent<TeamProps> = (props) => {
  const [team, setTeam] = useState<Team>({ name: '', members: [] });
  const [teamState, setTeamState] = useState(TeamGameState.createTeam);
  const [gameId, setGameId] = useState<string | undefined>(undefined);

  const createTeam = (team: Team) => {
    setTeam({ ...team });
    setTeamState(TeamGameState.teamCreated);
  };

  const changeTeam = () => {
    setTeamState(TeamGameState.createTeam);
  };

  const joinGame = (id: string) => {
    setGameId(id);
    setTeamState(TeamGameState.roomJoined);
  };

  switch (teamState) {
    case TeamGameState.createTeam:
      return <CreateTeam createTeam={createTeam} team={team} />;
    case TeamGameState.teamCreated:
      return (
        <Fragment>
          <Link to="/">
            <Button color="link" block>
              Leave Quiz
            </Button>
          </Link>
          <ShowRooms team={team} changeTeam={changeTeam} joinGame={joinGame} />
        </Fragment>
      );
    case TeamGameState.roomJoined:
      return (
        <TeamGame team={team} gameId={gameId} onDisconnect={props.onError} />
      );
    default:
      return <CreateTeam createTeam={setTeam} team={team} />;
  }
};
