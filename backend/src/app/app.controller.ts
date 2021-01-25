import { controller, IAppController } from '@foal/core';
import { createConnection } from 'typeorm';

import { UserArtifactController, UserPreferenceController } from './controllers';

export class AppController implements IAppController {
  subControllers = [
    controller('/user-preferences', UserPreferenceController),
    controller('/user-artifacts', UserArtifactController)
  ];

  async init() {
    await createConnection();
  }
}
