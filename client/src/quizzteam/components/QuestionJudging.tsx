import React, { FunctionComponent, Fragment } from 'react';
import { AnswerModel } from './TeamGame';
import Button from 'reactstrap/lib/Button';

export const QuestionJudging: FunctionComponent<{
  question: {
    question: string;
    answer: string;
  };
  teamAnswer: AnswerModel;
}> = (props) => {
  if (!props.question) {
    return <div>No question was set.</div>;
  }

  const notifyQuizMasterForNextQuestion = () => {
    console.log('Team is ready for next question!');
  };

  return (
    <Fragment>
      <p>{props.question.question}</p>
      {props.teamAnswer.judged && !props.teamAnswer.correct ? (
        <p>Answer should've been: {props.question.answer}</p>
      ) : null}
      <p>Your answer:</p>
      <p>{props.teamAnswer.answer}</p>
      {props.teamAnswer.judged && props.teamAnswer.correct ? (
        <p>{'Correct! :D'}</p>
      ) : null}
      {props.teamAnswer.judged && !props.teamAnswer.correct ? (
        <p>{'Incorrect :('}</p>
      ) : null}
      <Button
        color="primary"
        block
        onClick={() => notifyQuizMasterForNextQuestion()}
      >
        Next question
      </Button>
    </Fragment>
  );
};
