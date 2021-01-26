import {
    ApiDefineTag,
    ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
    ApiUseTag, Context, Delete, Get, HttpResponseCreated,
    HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
    Put, ValidateBody, ValidatePathParam, ValidateQueryParam
  } from '@foal/core';
  import { getRepository } from 'typeorm';
  
  import { User } from '../../entities';
  import { ValidateQuery } from '../../hooks';
  
  const userSchemaWithoutPassword = {
    additionalProperties: false,
    properties: {
      email: { type: 'string' },
      username: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      status: { type: 'string' },
      role: { type: 'string' },
    },
    required: [ 'email' ],
    type: 'object',
  };

  const userSchema = {
    ...userSchemaWithoutPassword,
    properties: {
      ...userSchemaWithoutPassword.properties,
      password: { type: 'string' }
    },
    required: [ ...userSchemaWithoutPassword.required, 'password' ],
    type: 'object',
  };
  
  @ApiDefineTag({
    name: 'User',
    description: 'These are the registered users of the social media platform. This API endpoint will manage ' +
        'account creation and management by admins (self registration is done through the' +
        '[Authentication](#/Authentication) api), profile updates, fetching user lists to add friends, etc.'
  })
  @ApiUseTag('User')
  export class UserController {
  
    @Get()
    @ApiOperationId('findUser')
    @ApiOperationSummary('Find user.')
    @ApiOperationDescription(
      'The query parameters "skip" and "take" can be used for pagination. The first ' +
      'is the offset and the second is the number of elements to be returned.'
    )
    @ApiResponse(400, { description: 'Invalid query parameters.' })
    @ApiResponse(200, { description: 'Returns a list of users.' })
    @ValidateQueryParam('skip', { type: 'number' }, { required: false })
    @ValidateQueryParam('take', { type: 'number' }, { required: false })
    @ValidateQuery({...userSchemaWithoutPassword, required: []})
    async findUsers(ctx: Context<User>) {
      const users: Partial<User>[] = await getRepository(User).find({
        skip: ctx.request.query.skip,
        take: ctx.request.query.take,
        where: {
          email: ctx.request.query.email,
          username: ctx.request.query.username,
          firstName: ctx.request.query.firstName,
          lastName: ctx.request.query.lastName,
          status: ctx.request.query.status,
          role: ctx.request.query.role
        }
      });

      for (const user of users) {
        delete user.password;
      }
      
      return new HttpResponseOK(users);
    }
  
    @Get('/:userId')
    @ApiOperationId('findUserById')
    @ApiOperationSummary('Find a user by ID.')
    @ApiResponse(404, { description: 'User not found.' })
    @ApiResponse(200, { description: 'Returns the user.' })
    @ValidatePathParam('userId', { type: 'number' })
    async findUserById(ctx: Context<User>) {
      const user: Partial<User> | undefined = await getRepository(User).findOne({
        id: ctx.request.params.userId
      });
  
      if (!user) {
        return new HttpResponseNotFound();
      }

      delete user.password;
  
      return new HttpResponseOK(user);
    }
  
    @Post()
    @ApiOperationId('createUser')
    @ApiOperationSummary('Create a new user.')
    @ApiResponse(400, { description: 'Invalid user.' })
    @ApiResponse(201, { description: 'User successfully created. Returns the user.' })
    @ValidateBody(userSchema)
    async createUser(ctx: Context<User>) {
      const user: Partial<User> | undefined = await getRepository(User).save({
        ...ctx.request.body
      });
      delete user?.password;
      return new HttpResponseCreated(user);
    }
  
    @Patch('/:userId')
    @ApiOperationId('modifyUser')
    @ApiOperationSummary('Update/modify an existing user.')
    @ApiResponse(400, { description: 'Invalid user.' })
    @ApiResponse(404, { description: 'User not found.' })
    @ApiResponse(200, { description: 'User successfully updated. Returns the user.' })
    @ValidatePathParam('userId', { type: 'number' })
    @ValidateBody({ ...userSchemaWithoutPassword, required: [] })
    async modifyUser(ctx: Context<User>) {
      const user = await getRepository(User).findOne({
        id: ctx.request.params.userId,
      });
  
      if (!user) {
        return new HttpResponseNotFound();
      }
  
      Object.assign(user, ctx.request.body);
  
      await getRepository(User).save(user);
  
      const returnUser: Partial<User> = user;
      delete returnUser.password;

      return new HttpResponseOK(returnUser);
    }
  
    @Put('/:userId')
    @ApiOperationId('replaceUser')
    @ApiOperationSummary('Update/replace an existing user.')
    @ApiResponse(400, { description: 'Invalid user.' })
    @ApiResponse(404, { description: 'User not found.' })
    @ApiResponse(200, { description: 'User successfully updated. Returns the user.' })
    @ValidatePathParam('userId', { type: 'number' })
    @ValidateBody(userSchemaWithoutPassword)
    async replaceUser(ctx: Context<User>) {
      const user = await getRepository(User).findOne({
        id: ctx.request.params.userId,
      });
  
      if (!user) {
        return new HttpResponseNotFound();
      }
  
      Object.assign(user, ctx.request.body);
  
      await getRepository(User).save(user);
  
      const returnUser: Partial<User> = user;
      delete returnUser.password;
      return new HttpResponseOK(returnUser);
    }
  
    @Delete('/:userId')
    @ApiOperationId('deleteUser')
    @ApiOperationSummary('Delete a user.')
    @ApiResponse(404, { description: 'User not found.' })
    @ApiResponse(204, { description: 'User successfully deleted.' })
    @ValidatePathParam('userId', { type: 'number' })
    async deleteUser(ctx: Context<User>) {
      const user = await getRepository(User).findOne({
        id: ctx.request.params.userId
      });
  
      if (!user) {
        return new HttpResponseNotFound();
      }
  
      await getRepository(User).delete(ctx.request.params.userId);
  
      return new HttpResponseNoContent();
    }
  
  }
  