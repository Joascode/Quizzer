import React, { FunctionComponent } from 'react';
import ListGroup from 'reactstrap/lib/ListGroup';
import { CategoryModel, QuestionModel, TeamModel } from './HostGame';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';

interface QuizOverviewProps {
  roundNr: number;
  categories: CategoryModel[];
  maxNQuestions: number;
  questions: QuestionModel[];
  teams: TeamModel[];
}

export const QuizOverview: FunctionComponent<QuizOverviewProps> = (props) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: '20px 10px',
        textAlign: 'left',
        maxHeight: '100%',
      }}
    >
      <p style={{ fontWeight: 'bold', fontSize: '1.3em' }}>Quiz Overview</p>
      <ListGroup flush style={{ color: '#495057', overflowY: 'auto' }}>
        <ListGroupItem style={{ padding: '.75rem 0' }}>
          <p style={{ fontWeight: 'bold' }}>Round number</p>
          <p>{props.roundNr}</p>
        </ListGroupItem>
        <ListGroupItem style={{ padding: '.75rem 0' }}>
          <p style={{ fontWeight: 'bold' }}>Categories</p>
          <ListGroup>
            {props.categories.map((category, index) => {
              return (
                <ListGroupItem key={index}>{category.category}</ListGroupItem>
              );
            })}
          </ListGroup>
        </ListGroupItem>
        <ListGroupItem style={{ padding: '.75rem 0' }}>
          <p style={{ fontWeight: 'bold' }}>Question number</p>
          <p>
            {props.questions.length}/{props.maxNQuestions}
          </p>
        </ListGroupItem>
        <ListGroupItem style={{ padding: '.75rem 0' }}>
          <p style={{ fontWeight: 'bold' }}>Previous questions</p>
          <ListGroup>
            {props.questions.map((question, index) => {
              return (
                <ListGroupItem key={index}>{question.question}</ListGroupItem>
              );
            })}
          </ListGroup>
        </ListGroupItem>
        <ListGroupItem style={{ padding: '.75rem 0' }}>
          <p style={{ fontWeight: 'bold' }}>Teams</p>
          <ListGroup>
            {props.teams.map((team, index) => {
              return (
                <ListGroupItem key={index}>
                  <p>Name: {team.name}</p>
                  <p>Score: {team.score}</p>
                </ListGroupItem>
              );
            })}
          </ListGroup>
        </ListGroupItem>
      </ListGroup>
    </div>
  );
};
