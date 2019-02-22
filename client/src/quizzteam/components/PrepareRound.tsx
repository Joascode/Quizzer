import React, { Fragment, useEffect, useState } from 'react';
import Spinner from 'react-spinkit';

export const PrepareRound: React.FunctionComponent = () => {
  // return (
  //   <Fragment>
  //     <h1>Preparing round!</h1>
  //     <p>The host is currently preparing the round.</p>
  //   </Fragment>
  // );
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
      <h1>Preparing round</h1>
      <p>The host is currently preparing the round</p>
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
