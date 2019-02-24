import welcome from './welcome';
import sessions from './sessions';
import users from './users';
import app from './app';


const controllers = [
  welcome,
  sessions,
  users,
  app,
];

export default (router, container) => controllers.forEach(f => f(router, container));
