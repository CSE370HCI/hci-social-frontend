import { controller, IAppController } from '@foal/core';
import { createConnection } from 'typeorm';

import { ApiController } from './api.controller';
import { OpenApiController } from './openapi.controller';

export class AppController implements IAppController {
  subControllers = [
    controller('/swagger', OpenApiController),
    controller('/api', ApiController),
  ];

  async init() {
    await createConnection();
  }
}
