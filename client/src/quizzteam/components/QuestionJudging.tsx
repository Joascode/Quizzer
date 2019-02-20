import React, { FunctionComponent, Fragment } from 'react';
import { AnswerModel } from './TeamGame';
import Button from 'reactstrap/lib/Button';

export const QuestionJudging: FunctionComponent<{
  question: {
    question: string;
    answer: string;
  };
  teamAnswer?: AnswerModel;
}> = (props) => {
  if (!props.question) {
    return <div>No question was set.</div>;
  }

  const notifyQuizMasterForNextQuestion = () => {
    console.log('Team is ready for next question!');
  };

  const renderAnswerGiven = (answer: AnswerModel) => {
    return (
      <Fragment>
        <p>{props.question.question}</p>
        <p>Your answer:</p>
        <p>{answer.answer}</p>
        {answer.judged && answer.correct ? <p>{'Correct! :D'}</p> : null}
        {answer.judged && !answer.correct ? <p>{'Incorrect :('}</p> : null}

        {answer.judged && !answer.correct ? (
          <p>Answer should've been: {props.question.answer}</p>
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

  const renderNoAnswerGiven = () => {
    return (
      <Fragment>
        <p>{props.question.question}</p>
        <p>It seems you didn't send an answer.</p>
        <p>Answer should've been: {props.question.answer}</p>
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

  return props.teamAnswer
    ? renderAnswerGiven(props.teamAnswer)
    : renderNoAnswerGiven();
};
