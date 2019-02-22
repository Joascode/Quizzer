import React, { Fragment, useEffect, useState } from 'react';
import Spinner from 'react-spinkit';

export const PrepareQuestion: React.FunctionComponent = () => {
  const [showSpinner, isShowSpinner] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      isShowSpinner(true);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <Fragment>
      <h1>Selecting Question</h1>
      <p>Host is selecting a question, get ready!</p>
      <div
        style={{ display: 'flex', justifyContent: 'center', flex: '1 auto' }}
      >
        {showSpinner ? (
          <Spinner
            name="folding-cube"
            color="#007bff"
            style={{ width: '100px', height: '100px', top: '75px' }}
          />
        ) : null}
      </div>
    </Fragment>
  );
};
