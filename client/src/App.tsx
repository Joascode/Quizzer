import React, { Component, useState, FunctionComponent } from 'react';
import './App.css';
import { SelectRole } from './shared/components/SelectRole';
import { BrowserRouter, Route } from 'react-router-dom';
import { Team } from './quizzteam/components/Team';
import { Host } from './quizzmaster/components/Host';
import Alert from 'reactstrap/lib/Alert';

const App: FunctionComponent = () => {
  const [error, setError] = useState('');

  const onError = (reason: string) => {
    setError(reason);
  };

  const dismissError = () => {
    setError('');
  };

  return (
    <BrowserRouter>
      <div className="App">
        {error ? (
          <Alert color="danger" toggle={dismissError}>
            {error}
          </Alert>
        ) : null}
        <Route exact path="/" render={() => <SelectRole />} />
        <Route path="/host" render={() => <Host onError={onError} />} />
        <Route path="/team" render={() => <Team onError={onError} />} />
      </div>
    </BrowserRouter>
  );
};

export default App;
