import { ApiInfo, ApiServer, controller } from '@foal/core';
import { createConnection } from 'typeorm';

import { ConnectionController, GroupController, GroupMemberController, MessageController, PostController, PostTagController, UserArtifactController, UserPreferenceController } from './api';

@ApiInfo({
  title: 'HCI-Social API',
  version: '1.0.0'
})
@ApiServer({
  url: '/api'
})
export class ApiController {
  subControllers = [
    controller('/user-preferences', UserPreferenceController),
    controller('/user-artifacts', UserArtifactController),
    controller('/connections', ConnectionController),
    controller('/posts', PostController),
    controller('/post-tags', PostTagController),
    controller('/groups', GroupController),
    controller('/group-members', GroupMemberController),
    controller('/messages', MessageController)
  ];

  async init() {
    await createConnection();
  }
}
