import React, { useState, useReducer, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Team } from './Team';
import { QuizzDataAPI } from '../../shared/services/QuizzDataAPI';

interface RoomModel {
  _id: string;
  name: string;
}

interface ModalModel {
  open: boolean;
  id: string | undefined;
}

interface ModalAction {
  type: ModalActionTypes;
  payload: string | undefined;
}

enum ModalActionTypes {
  open,
  close,
}

enum PasswordStates {
  unvalidated,
  validating,
  correct,
  incorrect,
}

const reducer = (modalState: ModalModel, action: ModalAction): ModalModel => {
  switch (action.type) {
    case ModalActionTypes.open:
      return { open: true, id: action.payload };
    case ModalActionTypes.close:
      return { open: false, id: action.payload };
    default:
      return modalState;
  }
};

interface ShowRoomsProps {
  team: Team;
  changeTeam: ChangeTeamFunc;
  joinGame: JoinGameFunc;
}

export interface ChangeTeamFunc {
  (): void;
}

export interface JoinGameFunc {
  (id: string): void;
}

// TODO: Change the password handling in the modal. Create separate FunctionComponent for it.
export const ShowRooms: React.FunctionComponent<ShowRoomsProps> = props => {
  const [rooms, setRooms] = useState<RoomModel[]>([]);
  const [password, setPassword] = useState('');
  const [modalState, dispatchModal] = useReducer(reducer, {
    id: undefined,
    open: false,
  });
  const [passwordState, setPasswordState] = useState(
    PasswordStates.unvalidated,
  );

  const fetchRooms = async () => {
    const data = await QuizzDataAPI.getQuizs();
    console.log(data);
    setRooms([...data]);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const validatePassword = (id?: string) => {
    setPasswordState(PasswordStates.validating);
    if (id != null) {
      QuizzDataAPI.checkPass(id, password).then(valid => {
        console.log(valid);
        if (valid) {
          setPasswordState(PasswordStates.correct);
          // QuizzDataAPI.joinQuiz(id, props.team).then(joined => {
          //   // TODO: Check for teamname collision
          //   if (joined) {
          //     props.joinGame(id);
          //   } else {
          //     console.log('Something bad happened when joining a quiz.');
          //   }
          // });
          props.joinGame(id);
        } else {
          setPasswordState(PasswordStates.incorrect);
          setTimeout(() => {
            setPasswordState(PasswordStates.unvalidated);
          }, 1000);
        }
      });
    }
  };

  const openModal = (id: string) => {
    dispatchModal({ type: ModalActionTypes.open, payload: id });
  };

  const closeModal = () => {
    dispatchModal({ type: ModalActionTypes.close, payload: undefined });
  };

  return (
    <div>
      <h1>Select a game to join</h1>
      {rooms.map((room, index) => (
        <div key={index}>
          <p>{room.name}</p>
          <Button onClick={() => openModal(room._id)}>Join</Button>
        </div>
      ))}

      <div>
        <p>{props.team.name}</p>
        {props.team.members.map((member, index) => (
          <p key={index}>{member}</p>
        ))}
        <Button onClick={() => props.changeTeam()}>Change Team?</Button>
      </div>

      <Modal isOpen={modalState.open} toggle={closeModal}>
        <ModalHeader toggle={closeModal}>
          Enter pass for {modalState.id}
        </ModalHeader>
        <ModalBody>
          <input
            value={password}
            onChange={event => setPassword(event.target.value)}
          />
          <PasswordStatus state={passwordState} />
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            disabled={passwordState >= PasswordStates.validating}
            onClick={() => validatePassword(modalState.id)}
          >
            Do Something
          </Button>{' '}
          <Button color="secondary" onClick={closeModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

interface PasswordStatusProps {
  state: PasswordStates;
}

//TODO: Bouw om naar Context
// TODO: Work through containers, in which de context api makes connection with functions like these. Like a wrapper.
const PasswordStatus: React.FunctionComponent<PasswordStatusProps> = props => {
  switch (props.state) {
    case PasswordStates.unvalidated:
      return null;
    case PasswordStates.validating:
      return <p>Checking password...</p>;
    case PasswordStates.correct:
      return <p>Correct!</p>;
    case PasswordStates.incorrect:
      return <p>Incorrect!</p>;
    default:
      return null;
  }
};
