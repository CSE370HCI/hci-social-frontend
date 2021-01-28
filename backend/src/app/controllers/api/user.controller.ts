import {
  ApiDefineTag,
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, UserRequired, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';
import { getRepository } from 'typeorm';

import { User } from '../../entities';
import { ValidateQuery } from '../../hooks';
import { removeEmptyParams } from '../../utils';

function getUserSchema(withPassword) {
  return {
    additionalProperties: false,
    properties: {
      email: { type: 'string' },
      ...(withPassword ? {password: { type: 'string' }} : {}),
      username: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      status: { type: 'string' },
      role: { type: 'string' },
    },
    required: [ 'email', ...(withPassword ? ['password'] : []) ],
    type: 'object',
  };
}

function getUserParams(params: any, undefinedMode: 'remove' | 'default') {
  const resetDefaults = undefinedMode === 'default';

  const res = {
    email: params.email,
    password: params.password,
    username: resetDefaults ? params.username ?? '' : params.username,
    firstName: resetDefaults ? params.firstName ?? '' : params.firstName,
    lastName: resetDefaults ? params.lastName ?? '' : params.lastName,
    status: resetDefaults ? params.status ?? '' : params.status,
    role: resetDefaults ? params.role ?? '' : params.role
  }
  
  return undefinedMode === 'remove' ? removeEmptyParams(res) : res;
}

@ApiDefineTag({
  name: 'User',
  description: 'These are the registered users of the social media platform. This API endpoint will manage ' +
      'account creation and management by admins (self registration is done through the ' +
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
  @ValidateQuery({...getUserSchema(false), required: []})
  async findUsers(ctx: Context<User>) {
    const users = await getRepository(User).findAndCount({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: getUserParams(ctx.request.query, 'remove')
    });
    
    return new HttpResponseOK(users);
  }

  @Get('/:userId')
  @ApiOperationId('findUserById')
  @ApiOperationSummary('Find a user by ID.')
  @ApiResponse(404, { description: 'User not found.' })
  @ApiResponse(200, { description: 'Returns the user.' })
  @ValidatePathParam('userId', { type: 'number' })
  async findUserById(ctx: Context<User>) {
    const user = await getRepository(User).findOne({
      id: ctx.request.params.userId
    });

    if (!user) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(user);
  }

  @Post()
  @ApiOperationId('createUser')
  @ApiOperationSummary('Create a new user.')
  @ApiResponse(400, { description: 'Invalid user.' })
  @ApiResponse(201, { description: 'User successfully created. Returns the user.' })
  @UserRequired()
  @ValidateBody(getUserSchema(true))
  async createUser(ctx: Context<User>) {
    const user = await getRepository(User).save(
      getUserParams(ctx.request.body, 'default')
    );
    return new HttpResponseCreated(user);
  }

  @Patch('/:userId')
  @ApiOperationId('modifyUser')
  @ApiOperationSummary('Update/modify an existing user.')
  @ApiResponse(400, { description: 'Invalid user.' })
  @ApiResponse(404, { description: 'User not found.' })
  @ApiResponse(200, { description: 'User successfully updated. Returns the user.' })
  @UserRequired()
  @ValidatePathParam('userId', { type: 'number' })
  @ValidateBody({ ...getUserSchema(false), required: [] })
  async modifyUser(ctx: Context<User>) {
    const user = await getRepository(User).findOne({
      id: ctx.request.params.userId,
    });

    if (!user) {
      return new HttpResponseNotFound();
    }

    Object.assign(user, getUserParams(ctx.request.body, 'remove'));

    await getRepository(User).save(user);

    return new HttpResponseOK(user);
  }

  @Put('/:userId')
  @ApiOperationId('replaceUser')
  @ApiOperationSummary('Update/replace an existing user.')
  @ApiResponse(400, { description: 'Invalid user.' })
  @ApiResponse(404, { description: 'User not found.' })
  @ApiResponse(200, { description: 'User successfully updated. Returns the user.' })
  @UserRequired()
  @ValidatePathParam('userId', { type: 'number' })
  @ValidateBody(getUserSchema(false))
  async replaceUser(ctx: Context<User>) {
    const user = await getRepository(User).findOne({
      id: ctx.request.params.userId,
    });

    if (!user) {
      return new HttpResponseNotFound();
    }

    Object.assign(user, getUserParams(ctx.request.body, 'default'));

    await getRepository(User).save(user);

    return new HttpResponseOK(user);
  }

  @Delete('/:userId')
  @ApiOperationId('deleteUser')
  @ApiOperationSummary('Delete a user.')
  @ApiResponse(404, { description: 'User not found.' })
  @ApiResponse(204, { description: 'User successfully deleted.' })
  @UserRequired()
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
  