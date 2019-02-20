import React, { useState, useReducer, useEffect, Fragment } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Team } from './Team';
import { QuizzDataAPI } from '../../shared/services/QuizzDataAPI';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import ListGroup from 'reactstrap/lib/ListGroup';

interface RoomModel {
  _id: string;
  name: string;
  hasPassword: boolean;
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
  changeTeam: () => void;
  joinGame: (id: string, password: string) => void;
  leaveLobby: () => void;
}

// TODO: Change the password handling in the modal. Create separate FunctionComponent for it.
export const ShowRooms: React.FunctionComponent<ShowRoomsProps> = (props) => {
  const [rooms, setRooms] = useState<RoomModel[]>([]);
  const [password, setPassword] = useState('');
  const [modalState, dispatchModal] = useReducer(reducer, {
    id: undefined,
    open: false,
  });
  const [passwordState, setPasswordState] = useState(
    PasswordStates.unvalidated,
  );
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    setLoading(true);
    const data = await QuizzDataAPI.getQuizs();
    console.log(data);
    setRooms([...data]);
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const validatePassword = (id?: string) => {
    setPasswordState(PasswordStates.validating);
    if (id != null) {
      // TODO: Check on backend if quiz is still open to join before telling the pass is correct.
      QuizzDataAPI.checkPass(id, password).then((valid) => {
        console.log(valid);
        if (valid) {
          setPasswordState(PasswordStates.correct);
          props.joinGame(id, password);
        } else {
          setPasswordState(PasswordStates.incorrect);
          setTimeout(() => {
            setPasswordState(PasswordStates.unvalidated);
          }, 1000);
        }
      });
    }
  };

  const joinQuiz = (quizId: string, hasPassword: boolean) => {
    if (hasPassword) {
      openModal(quizId);
    } else {
      QuizzDataAPI.checkPass(quizId, '')
        .then((valid) => {
          if (valid) {
            props.joinGame(quizId, password);
          } else {
            console.log('Failed to join quiz without password');
          }
        })
        .catch((err) => console.log(err));
    }
  };

  const openModal = (id: string) => {
    dispatchModal({ type: ModalActionTypes.open, payload: id });
  };

  const closeModal = () => {
    dispatchModal({ type: ModalActionTypes.close, payload: undefined });
  };

  return (
    <Fragment>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Button color="link" onClick={props.leaveLobby}>
          {'< Leave Lobby'}
        </Button>
        <Button color="link" onClick={fetchRooms} disabled={loading}>
          Refresh
        </Button>
      </div>
      <h1>Join a Quizz</h1>
      {loading ? (
        <p style={{ flex: '1 auto' }}>Fetching Quizz's..</p>
      ) : rooms.length > 0 ? (
        <ListGroup flush style={{ flex: '1 auto', overflowY: 'auto' }}>
          {rooms.map((room, index) => (
            <ListGroupItem
              key={index}
              style={{
                display: 'flex',
                flexFlow: 'row nowrap',
                justifyContent: 'space-between',
              }}
            >
              <p
                title={room.name}
                style={{
                  flex: '2 auto',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textAlign: 'left',
                  margin: 'auto',
                }}
              >
                {room.name}
              </p>
              <div
                style={{
                  display: 'flex',
                  flexFlow: 'row nowrap',
                  justifyContent: 'center',
                }}
              >
                {room.hasPassword ? (
                  <p style={{ margin: 'auto 10px' }}>locked</p>
                ) : null}
                <Button
                  color="success"
                  onClick={() => joinQuiz(room._id, room.hasPassword)}
                >
                  Join
                </Button>
              </div>
            </ListGroupItem>
          ))}
        </ListGroup>
      ) : (
        <p style={{ flex: '1 auto' }}>No Quizz's available</p>
      )}
      <div>
        <Button color="primary" block onClick={() => props.changeTeam()}>
          Change Team?
        </Button>
      </div>
      <Modal isOpen={modalState.open} toggle={closeModal}>
        <ModalHeader toggle={closeModal}>
          Enter pass for {modalState.id}
        </ModalHeader>
        <ModalBody>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
      </Modal>{' '}
    </Fragment>
  );
};

interface PasswordStatusProps {
  state: PasswordStates;
}

//TODO: Bouw om naar Context
// TODO: Work through containers, in which de context api makes connection with functions like these. Like a wrapper.
const PasswordStatus: React.FunctionComponent<PasswordStatusProps> = (
  props,
) => {
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
