import { controller, IAppController } from '@foal/core';
import { createConnection } from 'typeorm';

import { UserPreferenceController } from './controllers';

export class AppController implements IAppController {
  subControllers = [
    controller('/user-preferences', UserPreferenceController)
  ];

  async init() {
    await createConnection();
  }
}
