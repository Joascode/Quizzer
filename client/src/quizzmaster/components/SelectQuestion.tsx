import React, { FunctionComponent, useEffect, useState, Fragment } from 'react';
import { CategoryModel, QuestionModel } from './HostGame';
import { QuizzDataHandler } from '../../shared/services/QuizzDataHandler';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import ListGroupItemHeading from 'reactstrap/lib/ListGroupItemHeading';
import ListGroupItemText from 'reactstrap/lib/ListGroupItemText';
import Button from 'reactstrap/lib/Button';

interface SelectQuestionProps {
  unavailableQuestions: QuestionModel[];
  categories: CategoryModel[];
  selectQuestion: (question: QuestionModel) => void;
}

export const SelectQuestion: FunctionComponent<SelectQuestionProps> = props => {
  const [questions, setQuestions] = useState<QuestionModel[]>([]);
  const [questionOpen, setQuestionOpen] = useState<{
    index?: number;
    open: boolean;
  }>({
    index: undefined,
    open: false,
  });
  const [mounted, setMounted] = useState(true);

  useEffect(
    () => {
      fetchNewRandomQuestions();
    },
    [props.categories, props.unavailableQuestions],
  );

  // TODO: Filter the questions based on categories AND unavailablequestions (unavailable as in: they have already been used in the quiz/round)
  const fetchNewRandomQuestions = () => {
    QuizzDataHandler.fetchRandomQuestions(
      props.categories,
      err => {
        console.log('Something bad happened while fetching categories.');
        console.log(err);
      },
      questions => {
        console.log('Succesfully fetched categories');
        console.log(questions);
        if (mounted) setQuestions(questions);
      },
    );
  };

  const showDetails = (index: number) => {
    if (questionOpen.index === index) {
      setQuestionOpen({ index: index, open: !questionOpen.open });
    } else {
      setQuestionOpen({ index: index, open: true });
    }
  };

  return (
    <Fragment>
      <h3>Pick a question</h3>
      <Button onClick={() => fetchNewRandomQuestions()}>Refresh</Button>
      <ListGroup>
        {questions.map((question, index) => {
          return (
            <div key={index}>
              <ListGroupItem action onClick={() => showDetails(index)}>
                {question.question}
              </ListGroupItem>
              {questionOpen.index === index && questionOpen.open ? (
                <ListGroup>
                  <ListGroupItemHeading>
                    {question.category.category}
                  </ListGroupItemHeading>
                  <ListGroupItemText>{question.answer}</ListGroupItemText>
                </ListGroup>
              ) : null}
              <Button
                color="primary"
                onClick={() => props.selectQuestion(question)}
              >
                Choose
              </Button>
            </div>
          );
        })}
      </ListGroup>
    </Fragment>
  );
};
