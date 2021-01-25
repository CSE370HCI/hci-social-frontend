import { controller, IAppController } from '@foal/core';
import { createConnection } from 'typeorm';

import { ConnectionController, GroupController, PostController, PostTagController, UserArtifactController, UserPreferenceController } from './controllers';

export class AppController implements IAppController {
  subControllers = [
    controller('/user-preferences', UserPreferenceController),
    controller('/user-artifacts', UserArtifactController),
    controller('/connections', ConnectionController),
    controller('/posts', PostController),
    controller('/post-tags', PostTagController),
    controller('/groups', GroupController)
  ];

  async init() {
    await createConnection();
  }
}
