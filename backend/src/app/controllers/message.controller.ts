import {
  ApiDefineTag,
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';
import { getRepository } from 'typeorm';

import { Message, User } from '../entities';
import { ValidateQuery } from '../hooks';

const messageSchema = {
  additionalProperties: false,
  properties: {
    message: { type: 'string' },
  },
  oneOf: [
    {
      properties: { recipientUserID: { type: 'number' } },
      required: [ 'recipientUserID' ]
    },
    {
      properties: { recipientGroupID: { type: 'number' } },
      required: [ 'recipientGroupID' ]
    },
  ],
  required: [ 'message' ],
  type: 'object',
};

@ApiDefineTag({
  name: 'Message',
  description: `
    If your platform supports some type of chat or instant messaging, the messages API allows you
    to store the messages.
  `
})
@ApiUseTag('Message')
export class MessageController {

  @Get()
  @ApiOperationId('findMessages')
  @ApiOperationSummary('Find messages.')
  @ApiOperationDescription(
    'The query parameters "skip" and "take" can be used for pagination. The first ' +
    'is the offset and the second is the number of elements to be returned.'
  )
  @ApiResponse(400, { description: 'Invalid query parameters.' })
  @ApiResponse(200, { description: 'Returns a list of messages.' })
  @ValidateQueryParam('skip', { type: 'number' }, { required: false })
  @ValidateQueryParam('take', { type: 'number' }, { required: false })
  @ValidateQueryParam('userID', { type: 'number' }, { required: false })
  @ValidateQuery({...messageSchema, required: []})
  async findMessages(ctx: Context<User>) {
    const messages = await getRepository(Message).find({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: {
        owner: {
          id: ctx.request.query.userID
        },
        message: ctx.request.query.message,
        recipientUser: {
          id: ctx.request.query.recipientUserID
        },
        recipientGroup: {
          id: ctx.request.query.recipientGroupID
        }
      }
    });
    return new HttpResponseOK(messages);
  }

  @Get('/:messageId')
  @ApiOperationId('findMessageById')
  @ApiOperationSummary('Find a message by ID.')
  @ApiResponse(404, { description: 'Message not found.' })
  @ApiResponse(200, { description: 'Returns the message.' })
  @ValidatePathParam('messageId', { type: 'number' })
  async findMessageById(ctx: Context<User>) {
    const message = await getRepository(Message).findOne({
      id: ctx.request.params.messageId,
      owner: ctx.user
    });

    if (!message) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(message);
  }

  @Post()
  @ApiOperationId('createMessage')
  @ApiOperationSummary('Create a new message.')
  @ApiResponse(400, { description: 'Invalid message.' })
  @ApiResponse(201, { description: 'Message successfully created. Returns the message.' })
  @ValidateBody(messageSchema)
  async createMessage(ctx: Context<User>) {
    const { recipientUserID, recipientGroupID, ...body } = ctx.request.body;
    const message = await getRepository(Message).save({
      ...body,
      recipientUser: {
        id: recipientUserID
      },
      recipientGroup: {
        id: recipientGroupID
      },
      owner: ctx.user
    });
    return new HttpResponseCreated(message);
  }

  @Patch('/:messageId')
  @ApiOperationId('modifyMessage')
  @ApiOperationSummary('Update/modify an existing message.')
  @ApiResponse(400, { description: 'Invalid message.' })
  @ApiResponse(404, { description: 'Message not found.' })
  @ApiResponse(200, { description: 'Message successfully updated. Returns the message.' })
  @ValidatePathParam('messageId', { type: 'number' })
  @ValidateBody({ ...messageSchema, required: [] })
  async modifyMessage(ctx: Context<User>) {
    const message = await getRepository(Message).findOne({
      id: ctx.request.params.messageId,
      owner: ctx.user
    });

    if (!message) {
      return new HttpResponseNotFound();
    }

    const { recipientUserID, recipientGroupID, ...body } = ctx.request.body;
    Object.assign(message, body);
    if (recipientUserID) message.recipientUser.id = recipientUserID;
    if (recipientGroupID) message.recipientGroup.id = recipientGroupID;

    await getRepository(Message).save(message);

    return new HttpResponseOK(message);
  }

  @Put('/:messageId')
  @ApiOperationId('replaceMessage')
  @ApiOperationSummary('Update/replace an existing message.')
  @ApiResponse(400, { description: 'Invalid message.' })
  @ApiResponse(404, { description: 'Message not found.' })
  @ApiResponse(200, { description: 'Message successfully updated. Returns the message.' })
  @ValidatePathParam('messageId', { type: 'number' })
  @ValidateBody(messageSchema)
  async replaceMessage(ctx: Context<User>) {
    const message = await getRepository(Message).findOne({
      id: ctx.request.params.messageId,
      owner: ctx.user
    });

    if (!message) {
      return new HttpResponseNotFound();
    }

    const { recipientUserID, recipientGroupID, ...body } = ctx.request.body;
    Object.assign(message, ctx.request.body);
    message.recipientUser.id = recipientUserID;
    message.recipientGroup.id = recipientGroupID;

    await getRepository(Message).save(message);

    return new HttpResponseOK(message);
  }

  @Delete('/:messageId')
  @ApiOperationId('deleteMessage')
  @ApiOperationSummary('Delete a message.')
  @ApiResponse(404, { description: 'Message not found.' })
  @ApiResponse(204, { description: 'Message successfully deleted.' })
  @ValidatePathParam('messageId', { type: 'number' })
  async deleteMessage(ctx: Context<User>) {
    const message = await getRepository(Message).findOne({
      id: ctx.request.params.messageId,
      owner: ctx.user
    });

    if (!message) {
      return new HttpResponseNotFound();
    }

    await getRepository(Message).delete(ctx.request.params.messageId);

    return new HttpResponseNoContent();
  }

}
