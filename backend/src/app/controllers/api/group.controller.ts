import {
  ApiDefineTag,
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, UserRequired, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';
import { getRepository } from 'typeorm';

import { Group, User } from '../../entities';
import { ValidateQuery } from '../../hooks';
import { removeEmptyParams } from '../../utils';

const groupSchema = {
  additionalProperties: false,
  properties: {
    ownerID: {
      description: 'The user that created the group or is otherwise considered its owner. If you ' +
        'want system wide groups, you might set the user ID to `null` to specify a system group.',
      anyOf: [{ type: 'number' }, { type: 'null' }]
    },
    name: {
      description: 'Implementation specific field to store the name of this particular group',
      type: 'string'
    },
    type: {
      description: 'Implementation specific field to categorize groups',
      type: 'string'
    },
  },
  required: [],
  type: 'object',
};

function getGroupParams(params: any, undefinedMode: 'remove' | 'default') {
  const resetDefaults = undefinedMode === 'default';

  const res = {
    owner: {
      id: resetDefaults ? params.ownerID ?? null : params.ownerID
    },
    name: resetDefaults ? params.name ?? '' : params.name,
    type: resetDefaults ? params.type ?? '' : params.type
  }

  return undefinedMode === 'remove' ? removeEmptyParams(res) : res;
}

@ApiDefineTag({
  name: 'Group',
  description: 'If your platform supports groups, they can be created and managed through the groups API. ' +
    'This might be creating special interest groups among friends, or invite lists to events, or ' +
    ' security groups for post visibility, or all of the above!'
})
@ApiUseTag('Group')
export class GroupController {

  @Get()
  @ApiOperationId('findGroups')
  @ApiOperationSummary('Find groups.')
  @ApiOperationDescription(
    'The query parameters "skip" and "take" can be used for pagination. The first ' +
    'is the offset and the second is the number of elements to be returned.'
  )
  @ApiResponse(400, { description: 'Invalid query parameters.' })
  @ApiResponse(200, { description: 'Returns a list of groups.' })
  @ValidateQueryParam('skip', { type: 'number' }, { required: false })
  @ValidateQueryParam('take', { type: 'number' }, { required: false })
  @ValidateQuery({...groupSchema, required: []})
  async findGroups(ctx: Context<User>) {
    const groups = await getRepository(Group).findAndCount({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: getGroupParams(ctx.request.query, 'remove')
    });
    return new HttpResponseOK(groups);
  }

  @Get('/:groupId')
  @ApiOperationId('findGroupById')
  @ApiOperationSummary('Find a group by ID.')
  @ApiResponse(404, { description: 'Group not found.' })
  @ApiResponse(200, { description: 'Returns the group.' })
  @ValidatePathParam('groupId', { type: 'number' })
  async findGroupById(ctx: Context<User>) {
    const group = await getRepository(Group).findOne({
      id: ctx.request.params.groupId
    });

    if (!group) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(group);
  }

  @Post()
  @ApiOperationId('createGroup')
  @ApiOperationSummary('Create a new group.')
  @ApiResponse(400, { description: 'Invalid group.' })
  @ApiResponse(201, { description: 'Group successfully created. Returns the group.' })
  @UserRequired()
  @ValidateBody(groupSchema)
  async createGroup(ctx: Context<User>) {
    const group = await getRepository(Group).save(
      getGroupParams(ctx.request.body, 'default')
    );
    return new HttpResponseCreated(group);
  }

  @Patch('/:groupId')
  @ApiOperationId('modifyGroup')
  @ApiOperationSummary('Update/modify an existing group.')
  @ApiResponse(400, { description: 'Invalid group.' })
  @ApiResponse(404, { description: 'Group not found.' })
  @ApiResponse(200, { description: 'Group successfully updated. Returns the group.' })
  @UserRequired()
  @ValidatePathParam('groupId', { type: 'number' })
  @ValidateBody({ ...groupSchema, required: [] })
  async modifyGroup(ctx: Context<User>) {
    const group = await getRepository(Group).findOne({
      id: ctx.request.params.groupId
    });

    if (!group) {
      return new HttpResponseNotFound();
    }

    Object.assign(group, getGroupParams(ctx.request.body, 'remove'));

    await getRepository(Group).save(group);

    return new HttpResponseOK(group);
  }

  @Put('/:groupId')
  @ApiOperationId('replaceGroup')
  @ApiOperationSummary('Update/replace an existing group.')
  @ApiResponse(400, { description: 'Invalid group.' })
  @ApiResponse(404, { description: 'Group not found.' })
  @ApiResponse(200, { description: 'Group successfully updated. Returns the group.' })
  @UserRequired()
  @ValidatePathParam('groupId', { type: 'number' })
  @ValidateBody(groupSchema)
  async replaceGroup(ctx: Context<User>) {
    const group = await getRepository(Group).findOne({
      id: ctx.request.params.groupId
    });

    if (!group) {
      return new HttpResponseNotFound();
    }

    Object.assign(group, getGroupParams(ctx.request.body, 'default'));

    await getRepository(Group).save(group);

    return new HttpResponseOK(group);
  }

  @Delete('/:groupId')
  @ApiOperationId('deleteGroup')
  @ApiOperationSummary('Delete a group.')
  @ApiResponse(404, { description: 'Group not found.' })
  @ApiResponse(204, { description: 'Group successfully deleted.' })
  @UserRequired()
  @ValidatePathParam('groupId', { type: 'number' })
  async deleteGroup(ctx: Context<User>) {
    const group = await getRepository(Group).findOne({
      id: ctx.request.params.groupId
    });

    if (!group) {
      return new HttpResponseNotFound();
    }

    await getRepository(Group).delete(ctx.request.params.groupId);

    return new HttpResponseNoContent();
  }

}
