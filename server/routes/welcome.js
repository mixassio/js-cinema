import Router from 'koa-router';

export default (router, { io, logger }) => {
  const apiRouter = new Router();
  apiRouter.get('root', '/', (ctx) => {
    logger(`welcome-page for user = ${ctx.session.userId}`);
  });

  return router
    .get('root', '/', (ctx) => {
      ctx.render('index', { gon: 2 });
    })
    .use('/api/v1', apiRouter.routes(), apiRouter.allowedMethods());
};
