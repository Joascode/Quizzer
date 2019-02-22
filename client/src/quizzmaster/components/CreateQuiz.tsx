import React, { useState, FunctionComponent, FormEvent, Fragment } from 'react';
import Container from 'reactstrap/lib/Container';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import { Button, FormFeedback } from 'reactstrap';
import Form from 'reactstrap/lib/Form';
import FormGroup from 'reactstrap/lib/FormGroup';
import Input from 'reactstrap/lib/Input';
import Label from 'reactstrap/lib/Label';

interface CreateQuizState {
  name: string;
  password: string;
  addPassword: boolean;
  maxNQuestions: number;
}

interface CreateQuizProps {
  createQuiz: CreateQuizFunc;
}

interface CreateQuizFunc {
  (name: string, maxNQuestions: number, pass: string): void;
}

export const CreateQuiz: FunctionComponent<CreateQuizProps> = (props) => {
  const [quizInfo, setQuizInfo] = useState<CreateQuizState>({
    name: '',
    password: '',
    addPassword: false,
    maxNQuestions: 2,
  });
  const [formAdjusted, setFormAdjusted] = useState(false);

  const createTeam = async (event: FormEvent) => {
    event.preventDefault();
    props.createQuiz(quizInfo.name, quizInfo.maxNQuestions, quizInfo.password);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    if (formAdjusted === false && name === 'name') setFormAdjusted(true);

    setQuizInfo({
      ...quizInfo,
      [name]: value,
    });
  };

  return (
    <Fragment>
      <h1>Lets create a Quiz!</h1>
      <Form
        style={{
          flex: '1 auto',
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'left',
        }}
        onSubmit={createTeam}
      >
        <FormGroup>
          <Label>Quizz name</Label>
          <Input
            invalid={quizInfo.name === '' && formAdjusted}
            placeholder="Quizz name"
            name="name"
            value={quizInfo.name}
            onChange={handleInputChange}
          />
          <FormFeedback>A quizz name is required</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label>Number of questions per round</Label>
          <Input
            invalid={
              (quizInfo.maxNQuestions <= 1 && formAdjusted) ||
              +quizInfo.maxNQuestions !== +quizInfo.maxNQuestions
            }
            placeholder="Number of questions per round"
            name="maxNQuestions"
            value={quizInfo.maxNQuestions}
            onChange={handleInputChange}
          />
          <FormFeedback>Round requires atleast 2 questions</FormFeedback>
        </FormGroup>
        <FormGroup check style={{ margin: '10px 0px 10px 5px' }}>
          <Label check>
            <Input
              name="addPassword"
              type="checkbox"
              checked={quizInfo.addPassword}
              onChange={handleInputChange}
            />
            Password?
          </Label>
        </FormGroup>
        {quizInfo.addPassword ? (
          <FormGroup>
            <Input
              placeholder="Enter password"
              name="password"
              type="password"
              value={quizInfo.password}
              onChange={handleInputChange}
            />
          </FormGroup>
        ) : null}
        <Button
          color="primary"
          block
          disabled={
            quizInfo.name === '' ||
            quizInfo.maxNQuestions <= 1 ||
            +quizInfo.maxNQuestions !== +quizInfo.maxNQuestions
          }
        >
          Create
        </Button>
      </Form>
    </Fragment>
  );
};
