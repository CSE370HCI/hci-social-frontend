# HCI-Social Backend
Backend/API layer for the UB CSE370 course project

## Getting Started
The simplest way to get started is by running `npm run develop`. This will start the application
in development mode, which configures the app appropriately for a local install,
automatically syncs the DB schema, and reloads if any changes are made. The API will be
available at http://localhost:3001/api, and the Swagger UI documentation will be available at
http://localhost:3001/swagger

For production:
- `npm run migrations` to apply any new DB schema changes
- `npm run build` to build the typescript
- `npm start` to run the app

## Development Scripts
- `npm run makemigrations` Creates new migration scripts with new DB schema changes. Run this
  whenever you make changes to entities. Note that this will remove your current sqlite DB
  and re-generate it (with the old schema), as diffs are done against the DB schema of the DB itself
- `npm run lint` Run ESLint to find any code style problems
- `npm run lint-fix` Run ESLint and automatically fix issues where possible
- `npm run test` Run mocha unit tests
- `npm run e2e` Run mocha end to end tests

## Framework Documentation
- [FoalTS](https://foalts.org/docs/) - API framework
- [TypeORM](https://typeorm.io/) - ORM (DB interface)
