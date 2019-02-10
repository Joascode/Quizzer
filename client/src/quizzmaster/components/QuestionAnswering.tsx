import React, { FunctionComponent, Fragment, useState, useEffect } from 'react';
import { TeamModel, QuestionModel } from './HostGame';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import Button from 'reactstrap/lib/Button';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import Dropdown from 'reactstrap/lib/Dropdown';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownItem from 'reactstrap/lib/DropdownItem';

interface QuestionAnsweringProps {
  teams: TeamModel[];
  question: QuestionModel | undefined;
  // decideAnswer: (teamAnswer: TeamAnswerModel, correct: boolean) => void;
  closeQuestion: () => void;
  annoyTeam: (annoyance: any, teamId: string) => void;
}

export const QuestionAnswering: FunctionComponent<QuestionAnsweringProps> = (
  props,
) => {
  if (!props.question) {
    return <div>No question was set.</div>;
  }
  const [timeToClose, setTimeToClose] = useState(5);
  const [dropdownOpen, isDropdownOpen] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) setTimeToClose(timeToClose - 1);
    }, 1000);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  });

  const pokeTeam = (poke: string, teamId: string) => {
    props.annoyTeam(poke, teamId);
    isDropdownOpen('');
  };

  const closeQuestion = () => {
    props.closeQuestion();
  };

  const toggle = () => {
    // isDropdownOpen(!dropdownOpen);
  };

  return (
    <Fragment>
      <h1>Question time!</h1>
      <div>
        <h3>{props.question.question}</h3>
        <p>{props.question.answer}</p>
      </div>
      <ListGroup>
        {props.teams.map((team, index) => {
          return (
            <ListGroupItem key={index}>
              {team.name} {team.answer.value}{' '}
              <Dropdown isOpen={dropdownOpen === team._id} toggle={() => {}}>
                <DropdownToggle onClick={() => isDropdownOpen(team._id)} caret>
                  Poke
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={() => pokeTeam('Really?', team._id)}>
                    Really?
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => pokeTeam('Nice typo..', team._id)}
                  >
                    Nice typo..
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => pokeTeam('Guess again', team._id)}
                  >
                    Guess again
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
              {/* <Button onClick={() => props.annoyTeam('Annoy', team._id)}>
                Annoy
              </Button> */}
            </ListGroupItem>
          );
        })}
      </ListGroup>
      <Button disabled={timeToClose > 0} onClick={() => closeQuestion()}>
        {' '}
        {/* TODO: Activate button when every team has answered or when timer has ended */}
        {timeToClose > 0 ? timeToClose : 'Close Question'}
      </Button>
    </Fragment>
  );
};
