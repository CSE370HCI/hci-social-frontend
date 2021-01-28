import { ApiDefineSecurityScheme, ApiInfo, ApiSecurityRequirement, ApiServer, Context, controller, Hook, HttpResponseNoContent, Options, UseSessions } from '@foal/core';
import { fetchUser } from '@foal/typeorm';
import { User } from '../entities';

import { ConnectionController, GroupController, GroupMemberController, MessageController, PostController, PostTagController, UserArtifactController, UserPreferenceController } from './api';
import { AuthController } from './api/auth.controller';
import { UserController } from './api/user.controller';

@ApiInfo({
  title: 'HCI-Social API',
  version: '1.0.0'
})
@ApiServer({
  url: '/api'
})
@ApiSecurityRequirement({ bearerAuth: [] })
@ApiDefineSecurityScheme('bearerAuth', {
  type: 'http',
  scheme: 'bearer'
})
@Hook(() => response => {
  response.setHeader('Access-Control-Allow-Origin', '*');
})
@UseSessions({
  user: fetchUser(User)
})
export class ApiController {
  subControllers = [
    controller('/auth', AuthController),
    controller('/users', UserController),
    controller('/user-preferences', UserPreferenceController),
    controller('/user-artifacts', UserArtifactController),
    controller('/connections', ConnectionController),
    controller('/posts', PostController),
    controller('/post-tags', PostTagController),
    controller('/groups', GroupController),
    controller('/group-members', GroupMemberController),
    controller('/messages', MessageController)
  ];

  @Options('*')
  options(ctx: Context) {
    const response = new HttpResponseNoContent();
    response.setHeader('Access-Control-Allow-Methods', 'HEAD, GET, POST, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }
}
