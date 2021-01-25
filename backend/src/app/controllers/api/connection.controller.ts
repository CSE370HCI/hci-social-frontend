import {
  ApiDefineTag,
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';
import { getRepository } from 'typeorm';

import { Connection, User } from '../../entities';
import { ValidateQuery } from '../../hooks';

const connectionSchema = {
  additionalProperties: false,
  properties: {
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
  required: [ 'connectedUserID' ],
  type: 'object',
};

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
  @ValidateQueryParam('userID', { type: 'number' }, { required: false })
  @ValidateQuery({...connectionSchema, required: []})
  async findConnections(ctx: Context<User>) {
    const connections = await getRepository(Connection).find({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: {
        owner: {
          id: ctx.request.query.userID
        },
        connectedUser: ctx.request.query.connectedUserID
      }
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
      id: ctx.request.params.connectionId,
      owner: ctx.user
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
  @ValidateBody(connectionSchema)
  async createConnection(ctx: Context<User>) {
    const { connectedUserID, ...body } = ctx.request.body;
    const connection = await getRepository(Connection).save({
      ...body,
      connectedUser: {
        id: connectedUserID
      },
      owner: ctx.user,
    });
    return new HttpResponseCreated(connection);
  }

  @Patch('/:connectionId')
  @ApiOperationId('modifyConnection')
  @ApiOperationSummary('Update/modify an existing connection.')
  @ApiResponse(400, { description: 'Invalid connection.' })
  @ApiResponse(404, { description: 'Connection not found.' })
  @ApiResponse(200, { description: 'Connection successfully updated. Returns the connection.' })
  @ValidatePathParam('connectionId', { type: 'number' })
  @ValidateBody({ ...connectionSchema, required: [] })
  async modifyConnection(ctx: Context<User>) {
    const connection = await getRepository(Connection).findOne({
      id: ctx.request.params.connectionId,
      owner: ctx.user
    });

    if (!connection) {
      return new HttpResponseNotFound();
    }

    const { connectedUserID, ...body } = ctx.request.body;
    Object.assign(connection, body);
    if (connectedUserID) connection.connectedUser.id = connectedUserID;

    await getRepository(Connection).save(connection);

    return new HttpResponseOK(connection);
  }

  @Put('/:connectionId')
  @ApiOperationId('replaceConnection')
  @ApiOperationSummary('Update/replace an existing connection.')
  @ApiResponse(400, { description: 'Invalid connection.' })
  @ApiResponse(404, { description: 'Connection not found.' })
  @ApiResponse(200, { description: 'Connection successfully updated. Returns the connection.' })
  @ValidatePathParam('connectionId', { type: 'number' })
  @ValidateBody(connectionSchema)
  async replaceConnection(ctx: Context<User>) {
    const connection = await getRepository(Connection).findOne({
      id: ctx.request.params.connectionId,
      owner: ctx.user
    });

    if (!connection) {
      return new HttpResponseNotFound();
    }

    const { connectedUserID, ...body } = ctx.request.body;
    Object.assign(connection, body);
    connection.connectedUser.id = connectedUserID;

    await getRepository(Connection).save(connection);

    return new HttpResponseOK(connection);
  }

  @Delete('/:connectionId')
  @ApiOperationId('deleteConnection')
  @ApiOperationSummary('Delete a connection.')
  @ApiResponse(404, { description: 'Connection not found.' })
  @ApiResponse(204, { description: 'Connection successfully deleted.' })
  @ValidatePathParam('connectionId', { type: 'number' })
  async deleteConnection(ctx: Context<User>) {
    const connection = await getRepository(Connection).findOne({
      id: ctx.request.params.connectionId,
      owner: ctx.user
    });

    if (!connection) {
      return new HttpResponseNotFound();
    }

    await getRepository(Connection).delete(ctx.request.params.connectionId);

    return new HttpResponseNoContent();
  }

}
