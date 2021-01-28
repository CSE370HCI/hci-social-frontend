import {
  ApiDefineTag,
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, UserRequired, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';
import { getRepository } from 'typeorm';

import { Message, User } from '../../entities';
import { ValidateQuery } from '../../hooks';
import { removeEmptyParams } from '../../utils';

const messageSchema = {
  additionalProperties: false,
  properties: {
    authorID: { type: 'number' },
    content: { type: 'string' },
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
  required: [ 'authorID', 'content' ],
  type: 'object',
};

function getMessageParams(params: any, undefinedMode: 'remove' | 'default') {
  const resetDefaults = undefinedMode === 'default';

  const res = {
    content: params.content,
    author: {
      id: params.authorID
    },
    recipientUser: {
      id: resetDefaults ? params.recipientUserID ?? null : params.recipientUserID
    },
    recipientGroup: {
      id: resetDefaults ? params.recipientGroupID ?? null : params.recipientGroupID
    }
  }

  return undefinedMode === 'remove' ? removeEmptyParams(res) : res;
}

@ApiDefineTag({
  name: 'Message',
  description: 'If your platform supports some type of chat or instant messaging, the messages API allows you ' +
    'to store the messages.'
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
  @ValidateQuery({...messageSchema, required: []})
  async findMessages(ctx: Context<User>) {
    const messages = await getRepository(Message).findAndCount({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: getMessageParams(ctx.request.query, 'remove')
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
      id: ctx.request.params.messageId
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
  @UserRequired()
  @ValidateBody(messageSchema)
  async createMessage(ctx: Context<User>) {
    const message = await getRepository(Message).save(
      getMessageParams(ctx.request.body, 'default')
    );
    return new HttpResponseCreated(message);
  }

  @Patch('/:messageId')
  @ApiOperationId('modifyMessage')
  @ApiOperationSummary('Update/modify an existing message.')
  @ApiResponse(400, { description: 'Invalid message.' })
  @ApiResponse(404, { description: 'Message not found.' })
  @ApiResponse(200, { description: 'Message successfully updated. Returns the message.' })
  @UserRequired()
  @ValidatePathParam('messageId', { type: 'number' })
  @ValidateBody({ ...messageSchema, required: [] })
  async modifyMessage(ctx: Context<User>) {
    const message = await getRepository(Message).findOne({
      id: ctx.request.params.messageId
    });

    if (!message) {
      return new HttpResponseNotFound();
    }

    Object.assign(message, getMessageParams(ctx.request.body, 'remove'));

    await getRepository(Message).save(message);

    return new HttpResponseOK(message);
  }

  @Put('/:messageId')
  @ApiOperationId('replaceMessage')
  @ApiOperationSummary('Update/replace an existing message.')
  @ApiResponse(400, { description: 'Invalid message.' })
  @ApiResponse(404, { description: 'Message not found.' })
  @ApiResponse(200, { description: 'Message successfully updated. Returns the message.' })
  @UserRequired()
  @ValidatePathParam('messageId', { type: 'number' })
  @ValidateBody(messageSchema)
  async replaceMessage(ctx: Context<User>) {
    const message = await getRepository(Message).findOne({
      id: ctx.request.params.messageId
    });

    if (!message) {
      return new HttpResponseNotFound();
    }

    Object.assign(message, getMessageParams(ctx.request.body, 'default'));

    await getRepository(Message).save(message);

    return new HttpResponseOK(message);
  }

  @Delete('/:messageId')
  @ApiOperationId('deleteMessage')
  @ApiOperationSummary('Delete a message.')
  @ApiResponse(404, { description: 'Message not found.' })
  @ApiResponse(204, { description: 'Message successfully deleted.' })
  @UserRequired()
  @ValidatePathParam('messageId', { type: 'number' })
  async deleteMessage(ctx: Context<User>) {
    const message = await getRepository(Message).findOne({
      id: ctx.request.params.messageId
    });

    if (!message) {
      return new HttpResponseNotFound();
    }

    await getRepository(Message).delete(ctx.request.params.messageId);

    return new HttpResponseNoContent();
  }

}
