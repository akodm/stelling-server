import ErrnoException = NodeJS.ErrnoException;
import app from '../app';
import moment from 'moment';
import '../sequelize';

moment.locale("ko");

const debug = require("debug")("ts-express:server");
const http = require("http");

const normalizePort = (val: string) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

const onError = (error: ErrnoException) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string"
    ? "Pipe " + port
    : "Port " + port;

  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + addr.port;
  debug("Listening on " + bind);
}

// port set.
const port = normalizePort(process.env.PORT ?? "3333");
app.set("port", port);

// server create.
const server = http.createServer(app);

// server start.
server.listen(port, () => {
  console.log(`${process.env?.NODE_ENV} Hello Express ! ${moment().format("YYYY. MM. DD. (ddd) HH:mm:ss")}`);
  process.send && process.send("ready");
});
server.on("error", onError);
server.on("listening", onListening);