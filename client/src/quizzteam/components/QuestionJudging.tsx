import React, { FunctionComponent, Fragment } from 'react';
import { AnswerModel } from './TeamGame';
import Button from 'reactstrap/lib/Button';
import {
  IoIosClose,
  IoIosCheckmark,
  IoIosCheckmarkCircleOutline,
  IoIosCloseCircleOutline,
} from 'react-icons/io';

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
        <h1>Judging Answers</h1>
        <div style={{ flex: '1 1', display: 'flex', flexDirection: 'column' }}>
          <p>{props.question.question}</p>
          <p>Your answer:</p>
          <p style={{ fontSize: '1.7em', margin: '0', fontWeight: 'bold' }}>
            {answer.answer}
          </p>
          {answer.judged && !answer.correct ? (
            <p style={{ fontStyle: 'italic' }}>
              Answer should've been: {props.question.answer}
            </p>
          ) : null}
          <div style={{ flex: '1 1', justifyContent: 'center' }}>
            {answer.judged ? (
              answer.correct ? (
                <IoIosCheckmarkCircleOutline
                  style={{ fontSize: '7em', height: '100%', color: 'green' }}
                />
              ) : (
                <IoIosCloseCircleOutline
                  style={{ fontSize: '7em', height: '100%', color: 'red' }}
                />
              )
            ) : null}
          </div>
        </div>
        <Button
          disabled
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
        <h1>Judging Answers</h1>
        <div style={{ flex: '1 1' }}>
          <p>{props.question.question}</p>
          <p style={{ fontSize: '1.7em', fontWeight: 'bold' }}>
            It seems you didn't send an answer.
          </p>
          <p>Answer should've been: {props.question.answer}</p>
        </div>
        <Button
          disabled
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
