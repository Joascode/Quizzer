import React, { Fragment } from 'react';
import Spinner from 'react-spinkit';

export const PrepareQuestion: React.FunctionComponent = () => {
  return (
    <Fragment>
      <h1>Selecting Question</h1>
      <p>Host is selecting a question, get ready!</p>
      <div
        style={{ display: 'flex', justifyContent: 'center', flex: '1 auto' }}
      >
        <Spinner
          name="folding-cube"
          color="#007bff"
          style={{ width: '100px', height: '100px', top: '75px' }}
        />
      </div>
    </Fragment>
  );
};
