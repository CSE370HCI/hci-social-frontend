import { controller, IAppController } from '@foal/core';
import { createConnection } from 'typeorm';

import { ConnectionController, UserArtifactController, UserPreferenceController } from './controllers';

export class AppController implements IAppController {
  subControllers = [
    controller('/user-preferences', UserPreferenceController),
    controller('/user-artifacts', UserArtifactController),
    controller('/connections', ConnectionController)
  ];

  async init() {
    await createConnection();
  }
}
