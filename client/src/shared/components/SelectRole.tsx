import React, { FunctionComponent, useState } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { EmojiData, NimblePicker, NimbleEmoji } from 'emoji-mart';
import data from 'emoji-mart/data/emojione.json';
import 'emoji-mart/css/emoji-mart.css';

export const SelectRole: FunctionComponent = () => {
  return (
    <Container>
      <Row>
        <Col sm="12" md={{ size: 6, offset: 3 }} lg={{ size: 4, offset: 4 }}>
          <h1>Quizzer</h1>
          <div
            className="role-buttons-container"
            style={{
              flex: '1 auto',
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <Link style={{ margin: '10px 0px' }} to="/host">
              <Button color="primary" block>
                Create Quizz
              </Button>
            </Link>
            <Link style={{ margin: '10px 0px' }} to="/team">
              <Button color="primary" block>
                Join Quizz
              </Button>
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};
