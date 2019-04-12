import React, { useState, Fragment, FunctionComponent } from 'react';
import { CreateTeam } from './CreateTeam';
import { ShowRooms } from './ShowRooms';
import { TeamGame } from './TeamGame';
import Button from 'reactstrap/lib/Button';
import { Link, Redirect } from 'react-router-dom';
import Container from 'reactstrap/lib/Container';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import { IoIosArrowDropleft } from 'react-icons/io';

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
  returnToHome,
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
  const [password, setPassword] = useState<string>('');

  const createTeam = (team: Team) => {
    setTeam({ ...team });
    setTeamState(TeamGameState.teamCreated);
  };

  const changeTeam = () => {
    setTeamState(TeamGameState.createTeam);
  };

  const joinGame = (id: string, password: string) => {
    setGameId(id);
    setPassword(password);
    setTeamState(TeamGameState.roomJoined);
  };

  const returnToHome = () => {
    setTeamState(TeamGameState.returnToHome);
  };

  switch (teamState) {
    case TeamGameState.returnToHome: {
      return <Redirect to="/" />;
    }
    case TeamGameState.createTeam:
      return (
        <Container>
          <Row>
            <Col
              sm="12"
              md={{ size: 6, offset: 3 }}
              lg={{ size: 6, offset: 3 }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Button color="link" onClick={returnToHome}>
                  {
                    <IoIosArrowDropleft
                      style={{ color: '#007bff', fontSize: '1.3em' }}
                    />
                  }{' '}
                  Return
                </Button>
              </div>
              <CreateTeam createTeam={createTeam} team={team} />
            </Col>
          </Row>
        </Container>
      );
    case TeamGameState.teamCreated:
      return (
        <Container>
          <Row>
            <Col
              sm="12"
              md={{ size: 6, offset: 3 }}
              lg={{ size: 6, offset: 3 }}
            >
              <ShowRooms
                team={team}
                changeTeam={changeTeam}
                joinGame={joinGame}
                leaveLobby={returnToHome}
              />
            </Col>
          </Row>
        </Container>
      );
    case TeamGameState.roomJoined:
      return (
        <Container>
          <Row>
            <Col
              sm="12"
              md={{ size: 6, offset: 3 }}
              lg={{ size: 6, offset: 3 }}
            >
              <TeamGame
                team={team}
                gameId={gameId}
                password={password}
                onDisconnect={props.onError}
              />
            </Col>
          </Row>
        </Container>
      );
    default:
      return (
        <Container>
          <Row>
            <Col
              sm="12"
              md={{ size: 6, offset: 3 }}
              lg={{ size: 6, offset: 3 }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Button color="link" onClick={returnToHome}>
                  {
                    <IoIosArrowDropleft
                      style={{ color: '#007bff', fontSize: '1.3em' }}
                    />
                  }{' '}
                  Return
                </Button>
              </div>
              <CreateTeam createTeam={setTeam} team={team} />;
            </Col>
          </Row>
        </Container>
      );
  }
};
