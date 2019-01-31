// https://dev.to/oieduardorabelo/react-hooks-how-to-create-and-update-contextprovider-1f68
// Use this for context and hooks

import React, { Component } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import { Link } from 'react-router-dom';

export class SelectRole extends Component {
  render() {
    return (
      <div>
        <Container>
          <Row>
            <Col sm="12" md={{ size: 6, offset: 3 }}>
              <h1>Quizzer</h1>
              <Link to="/host">
                <Button color="primary" block>
                  Create
                </Button>
              </Link>
              <Link to="/team">
                <Button color="primary" block>
                  Join
                </Button>
              </Link>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
