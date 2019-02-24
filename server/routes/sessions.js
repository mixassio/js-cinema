import buildFormObj from '../../lib/formObjectBuilder';
import { encrypt } from '../../lib/secure';
import { User } from '../models';

export default (router, { io, logger }) => {
  router
    .get('newSession', '/session/new', async (ctx) => {
      const data = {};
      ctx.render('sessions/new', { f: buildFormObj(data) });
    })
    .post('session', '/session', async (ctx) => {
      const { email, password } = ctx.request.body.form;
      logger(`Find user with e-mail= ${email}`);
      const user = await User.findOne({ where: { email } });
      if (user && user.passwordDigest === encrypt(password)) {
        logger(`User was finded ${user.id}`);
        logger(user.passwordDigest, encrypt(password));
        ctx.session.userId = user.id;
        logger(`Create new session. User= ${user.id}`);
        ctx.redirect(router.url('app'));
        return;
      }
      logger(`User with e-mail= ${email} was not finded`);
      const errors = [];
      if (!user) {
        logger('Not user');
        errors.push({ message: 'User not registration', path: 'email' });
      } else {
        logger('Wrong password');
        errors.push({ message: 'Wrong password', path: 'password' });
      }
      ctx.flash.set('No email or wrong password');
      ctx.render('sessions/new', { f: buildFormObj({ email }, { errors }) });
    })
    .delete('session', '/session', (ctx) => {
      logger(`Delete session user= ${ctx.session.userId}`);
      ctx.session = {};
      ctx.redirect(router.url('root'));
    });
};
