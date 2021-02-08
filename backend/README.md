# HCI-Social Backend
Backend/API layer for the UB CSE370 course project

## Getting Started
First install the dependencies:
- `npm install`

From there, there are two different ways to start the app

### Development
The simplest way to get started is by running `npm run develop`. This will start the application
in development mode, which configures the app appropriately for a local install,
automatically syncs the DB schema, and reloads itself if any changes are made. The API will be
available at http://localhost:3001/api, and the Swagger UI documentation will be available at
http://localhost:3001/swagger

### Production 
- `npm run build` to build the typescript to javascript
- `npm start` to run the app in production mode

## Development Scripts
- `npm run lint` Run ESLint to find any code style problems
- `npm run lint-fix` Run ESLint and automatically fix issues where possible
- `npm run test` Run mocha unit tests
- `npm run e2e` Run mocha end to end tests

## Framework Documentation
- [FoalTS](https://foalts.org/docs/) - API framework
- [TypeORM](https://typeorm.io/) - ORM (DB interface)

## Other Resources
If you want to inspect the database manually, you might want to try either:
- [SQLite Tools](https://www.sqlite.org/download.html), which provides the `sqlite3` command
  to start a SQL shell
- [SQLite Studio](https://sqlitestudio.pl/) if you want a graphical browser
