// import '@babel/polyfill';

import gulp from 'gulp';
import repl from 'repl';
import getServer from './server';
import container from './server/container';

gulp.task('default', console.log('Hello, world and gulp'));

gulp.task('console', () => {
  const replServer = repl.start({
    prompt: 'Application console > ',
  });

  Object.keys(container).forEach((key) => {
    replServer.context[key] = container[key];
  });
});
gulp.task('server', (cb) => {
  getServer().listen(process.env.PORT || 4000, cb);
});
