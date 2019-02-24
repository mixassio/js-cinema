
import '@babel/polyfill';

import path from 'path';
import _ from 'lodash';
import Koa from 'koa';
import serve from 'koa-static';
import Pug from 'koa-pug';
import koaLogger from 'koa-logger';
import socket from 'socket.io';
import http from 'http';
import Router from 'koa-router';
import mount from 'koa-mount';
import bodyParser from 'koa-bodyparser';
import koaWebpack from 'koa-webpack';
import methodOverride from 'koa-methodoverride';
import session from 'koa-generic-session';
import flash from 'koa-flash-simple';
import favicon from 'koa-favicon';

import Rollbar from 'rollbar';
import container from './container';
import addRoutes from './routes';

import webpackConfig from '../webpack.config.babel';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

export default () => {
  const app = new Koa();

  const { logger } = container;
  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  const date = new Date();
  logger(`Application start at ${date.toString()}`);
  // logger(process.env);

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      logger(err);
      rollbar.error(err, ctx.request);
    }
  });

  // app.keys = [process.env.SESSION_SECRET];
  app.keys = ['im a newer secret', 'i like turtle'];
  app.use(session(app));
  app.use(flash());
  app.use(async (ctx, next) => {
    ctx.state = {
      flash: ctx.flash,
      isSignedIn: () => ctx.session.userId !== undefined,
    };
    await next();
  });
  app.use(bodyParser());

  if (isDevelopment) {
    koaWebpack({
      config: webpackConfig,
    }).then((middleware) => {
      app.use(middleware);
    });
  } else {
    const urlPrefix = '/assets';
    const assetsPath = path.resolve(`${__dirname}/../dist/public`);
    app.use(mount(urlPrefix, serve(assetsPath)));
  }

  app.use(methodOverride((req) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      logger('change method - req.body', req.body);
      return req.body._method; // eslint-disable-line
    }
    return null;
  }));
  app.use(favicon());
  /*
  logger(path.join(__dirname, '..', 'dist', 'public'));
  app.use(serve(path.join(__dirname, '..', 'dist', 'public')));
  */
  app.use(koaLogger());
  const router = new Router();

  const pug = new Pug({
    viewPath: path.join(__dirname, 'views'),
    noCache: container.env === 'development',
    debug: true,
    pretty: true,
    compileDebug: true,
    locals: [],
    basedir: path.join(__dirname, 'views'),
    helperPath: [
      { _ },
      { urlFor: (...args) => router.url(...args) },
    ],
  });
  pug.use(app);

  const server = http.createServer(app.callback());
  const io = socket(server);

  addRoutes(router, { ...container, io });
  app.use(router.allowedMethods());
  app.use(router.routes());

  return server;
};
