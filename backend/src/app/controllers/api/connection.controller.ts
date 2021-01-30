import {
  ApiDefineTag,
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, UserRequired, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';
import { getRepository } from 'typeorm';

import { Connection, User } from '../../entities';
import { ValidateQuery } from '../../hooks';
import { removeEmptyParams } from '../../utils';

const connectionSchema = {
  additionalProperties: false,
  properties: {
    userID: { type: 'number' },
    connectedUserID: { type: 'number' },
    type: {
      type: 'string',
      description: 'Implementation specific field for allowing different types of connections; ' +
        'you may want to have both friends and followers, for example'
    },
    status: {
      type: 'string',
      description: 'Implementation specific field for differentiating the current status of a connection; ' +
        'if people have to accept friend requests, for example, this could be set to "pending"' +
        'when a request is made.  If you block a friend, this may be set to "blocked", and so on.'
    }
  },
  required: [ 'userID', 'connectedUserID' ],
  type: 'object',
};

function getConnectionParams(params: any, undefinedMode: 'remove' | 'default') {
  const resetDefaults = undefinedMode === 'default';

  const res = {
    user: {
      id: params.userID
    },
    connectedUser: {
      id: params.connectedUserID
    },
    type: resetDefaults ? params.type ?? '' : params.type,
    status: resetDefaults ? params.status ?? '' : params.status
  }

  return undefinedMode === 'remove' ? removeEmptyParams(res) : res;
}

@ApiDefineTag({
  name: 'Connection',
  description: 'This dataset will hold all the connections between users (friends, followers, ' +
    'whatever your model calls for).'
})
@ApiUseTag('Connection')
export class ConnectionController {

  @Get()
  @ApiOperationId('findConnections')
  @ApiOperationSummary('Find connections.')
  @ApiOperationDescription(
    'The query parameters "skip" and "take" can be used for pagination. The first ' +
    'is the offset and the second is the number of elements to be returned.'
  )
  @ApiResponse(400, { description: 'Invalid query parameters.' })
  @ApiResponse(200, { description: 'Returns a list of connections.' })
  @ValidateQueryParam('skip', { type: 'number' }, { required: false })
  @ValidateQueryParam('take', { type: 'number' }, { required: false })
  @ValidateQuery({...connectionSchema, required: []})
  async findConnections(ctx: Context<User>) {
    const connections = await getRepository(Connection).findAndCount({
      relations: ['user', 'connectedUser'],
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: getConnectionParams(ctx.request.query, 'remove')
    });
    return new HttpResponseOK(connections);
  }

  @Get('/:connectionId')
  @ApiOperationId('findConnectionById')
  @ApiOperationSummary('Find a connection by ID.')
  @ApiResponse(404, { description: 'Connection not found.' })
  @ApiResponse(200, { description: 'Returns the connection.' })
  @ValidatePathParam('connectionId', { type: 'number' })
  async findConnectionById(ctx: Context<User>) {
    const connection = await getRepository(Connection).findOne({
      relations: ['user', 'connectedUser'],
      where: {
        id: ctx.request.params.connectionId
      }
    });

    if (!connection) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(connection);
  }

  @Post()
  @ApiOperationId('createConnection')
  @ApiOperationSummary('Create a new connection.')
  @ApiResponse(400, { description: 'Invalid connection.' })
  @ApiResponse(201, { description: 'Connection successfully created. Returns the connection.' })
  @UserRequired()
  @ValidateBody(connectionSchema)
  async createConnection(ctx: Context<User>) {
    const connection = await getRepository(Connection).save(
      getConnectionParams(ctx.request.body, 'default')
    );
    return new HttpResponseCreated(connection);
  }

  @Patch('/:connectionId')
  @ApiOperationId('modifyConnection')
  @ApiOperationSummary('Update/modify an existing connection.')
  @ApiResponse(400, { description: 'Invalid connection.' })
  @ApiResponse(404, { description: 'Connection not found.' })
  @ApiResponse(200, { description: 'Connection successfully updated. Returns the connection.' })
  @UserRequired()
  @ValidatePathParam('connectionId', { type: 'number' })
  @ValidateBody({ ...connectionSchema, required: [] })
  async modifyConnection(ctx: Context<User>) {
    const connection = await getRepository(Connection).findOne({
      id: ctx.request.params.connectionId
    });

    if (!connection) {
      return new HttpResponseNotFound();
    }

    Object.assign(connection, getConnectionParams(ctx.request.body, 'remove'));

    await getRepository(Connection).save(connection);

    return new HttpResponseOK(connection);
  }

  @Put('/:connectionId')
  @ApiOperationId('replaceConnection')
  @ApiOperationSummary('Update/replace an existing connection.')
  @ApiResponse(400, { description: 'Invalid connection.' })
  @ApiResponse(404, { description: 'Connection not found.' })
  @ApiResponse(200, { description: 'Connection successfully updated. Returns the connection.' })
  @UserRequired()
  @ValidatePathParam('connectionId', { type: 'number' })
  @ValidateBody(connectionSchema)
  async replaceConnection(ctx: Context<User>) {
    const connection = await getRepository(Connection).findOne({
      id: ctx.request.params.connectionId,
      user: ctx.user
    });

    if (!connection) {
      return new HttpResponseNotFound();
    }

    Object.assign(connection, getConnectionParams(ctx.request.body, 'default'));

    await getRepository(Connection).save(connection);

    return new HttpResponseOK(connection);
  }

  @Delete('/:connectionId')
  @ApiOperationId('deleteConnection')
  @ApiOperationSummary('Delete a connection.')
  @ApiResponse(404, { description: 'Connection not found.' })
  @ApiResponse(204, { description: 'Connection successfully deleted.' })
  @UserRequired()
  @ValidatePathParam('connectionId', { type: 'number' })
  async deleteConnection(ctx: Context<User>) {
    const connection = await getRepository(Connection).findOne({
      id: ctx.request.params.connectionId,
      user: ctx.user
    });

    if (!connection) {
      return new HttpResponseNotFound();
    }

    await getRepository(Connection).delete(ctx.request.params.connectionId);

    return new HttpResponseNoContent();
  }

}
