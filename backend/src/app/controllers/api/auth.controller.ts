import {
  ApiDefineTag, ApiUseTag, Context, createSession, dependency, hashPassword, HttpResponseOK,
  HttpResponseUnauthorized, Post, Store, UseSessions, ValidateBody, verifyPassword
} from '@foal/core';

import { User } from '../../entities';

const credentialsSchema = {
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string' }
  },
  required: [ 'email', 'password' ],
  type: 'object',
};

@ApiDefineTag({
  name: 'Authentication',
  description: 'An API exists that manages much of the work for account creation and management as well. ' +
    'This will manage login, set password, register, etc. To make authenticated requests after logging in, ' +
    'set the `Authorization` HTTP header with the value `Bearer <token>`'
})
@ApiUseTag('Authentication')
@UseSessions()
export class AuthController {
  @dependency
  store: Store;

  @Post('/signup')
  @ValidateBody(credentialsSchema)
  async signup(ctx: Context) {
    const user = new User();
    user.email = ctx.request.body.email;
    user.password = ctx.request.body.password;
    // TODO: Allow these to be configurable at signup?
    user.username = '';
    user.firstName = '';
    user.lastName = '';
    user.status= '';
    user.role = '';
    await user.save();

    ctx.session = await createSession(this.store);
    ctx.session.setUser(user);

    return new HttpResponseOK({
      token: ctx.session.getToken(),
      userID: user.id
    });
  }

  @Post('/login')
  @ValidateBody(credentialsSchema)
  async login(ctx: Context) {
    const passwordQueryResult = await User.findOne({
      where: {
        email: ctx.request.body.email
      },
      select: ['password']
    });

    if (!passwordQueryResult) {
      return new HttpResponseUnauthorized();
    }

    if (!await verifyPassword(ctx.request.body.password, passwordQueryResult.password)) {
      return new HttpResponseUnauthorized();
    }

    // A shame that we have to do this twice, but TypeORM doesn't have a way to force select
    // columns with `select: false` set.
    const user = await User.findOne({
      email: ctx.request.body.email
    });

    if (!user) {
      return new HttpResponseUnauthorized();
    }

    ctx.session = await createSession(this.store);
    ctx.session.setUser(user);

    return new HttpResponseOK({
      token: ctx.session.getToken(),
      userID: user.id
    });
  }

  @Post('/logout')
  async logout(ctx: Context) {
    if (ctx.session) {
      await ctx.session.destroy();
    }

    return new HttpResponseOK();
  }
}