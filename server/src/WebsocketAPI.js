import Websocket from 'ws';

export const websocketAPI = server => {
  const wss = server
    ? new Websocket(server)
    : new Websocket.Server({ port: 8081 });
  const rooms = [];

  wss.on('connection', ws => {
    ws.on('message', message => {
      // TODO: Check message action and filter based on quizId.
      console.log('received: %s', message);

      // TODO: Check types, to see what to do with the message.
      // ws.send(message, err => {
      //   if (err) console.log(err);
      // });
      wss.clients.forEach(client => {
        client.send(message, err => {
          if (err) console.log(err);
        });
      });
    });

    ws.on('close', (code, reason) => {
      console.log('Someone closed connection.');
      console.log(reason);

      // TODO: Close event gets called when tab is closed. At that moment nothing is send as data to the clients, which makes them crash.
      // Handle the closing of connection based on actually leaving the quiz and not leaving the site.
    });
  });
};
