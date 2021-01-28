import {
  ApiDefineTag,
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, UserRequired, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';
import { getRepository } from 'typeorm';

import { GroupMember, User } from '../../entities';
import { ValidateQuery } from '../../hooks';
import { removeEmptyParams } from '../../utils';

const groupMemberSchema = {
  additionalProperties: false,
  properties: {
    userID: { type: 'number' },
    groupID: { type: 'number' },
    type: {
      type: 'string',
      description: 'Implementation specific field to allow you to break members up into subcategories; ' +
        'could be "organizer" and "attendee" or "admin" and "user" - whatever ' +
        'makes sense to your platform.'
    },
  },
  required: [ 'userID', 'groupID' ],
  type: 'object',
};

function getGroupMemberParams(params: any, undefinedMode: 'remove' | 'default') {
  const resetDefaults = undefinedMode === 'default';

  const res = {
    user: {
      id: params.userID
    },
    group: {
      id: params.groupID
    },
    type: resetDefaults ? params.type ?? '' : params.type
  }

  return undefinedMode === 'remove' ? removeEmptyParams(res) : res;
}

@ApiDefineTag({
  name: 'Group Member',
  description: 'This will allow you to add or remove members from groups'
})
@ApiUseTag('Group Member')
export class GroupMemberController {

  @Get()
  @ApiOperationId('findGroupMembers')
  @ApiOperationSummary('Find group members.')
  @ApiOperationDescription(
    'The query parameters "skip" and "take" can be used for pagination. The first ' +
    'is the offset and the second is the number of elements to be returned.'
  )
  @ApiResponse(400, { description: 'Invalid query parameters.' })
  @ApiResponse(200, { description: 'Returns a list of group members.' })
  @ValidateQueryParam('skip', { type: 'number' }, { required: false })
  @ValidateQueryParam('take', { type: 'number' }, { required: false })
  @ValidateQuery({...groupMemberSchema, required: []})
  async findGroupMembers(ctx: Context<User>) {
    const groupMembers = await getRepository(GroupMember).findAndCount({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: getGroupMemberParams(ctx.request.query, 'remove')
    });
    return new HttpResponseOK(groupMembers);
  }

  @Get('/:groupMemberId')
  @ApiOperationId('findGroupMemberById')
  @ApiOperationSummary('Find a group member by ID.')
  @ApiResponse(404, { description: 'Group member not found.' })
  @ApiResponse(200, { description: 'Returns the group member.' })
  @ValidatePathParam('groupMemberId', { type: 'number' })
  async findGroupMemberById(ctx: Context<User>) {
    const groupMember = await getRepository(GroupMember).findOne({
      id: ctx.request.params.groupMemberId
    });

    if (!groupMember) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(groupMember);
  }

  @Post()
  @ApiOperationId('createGroupMember')
  @ApiOperationSummary('Create a new group member.')
  @ApiResponse(400, { description: 'Invalid group member.' })
  @ApiResponse(201, { description: 'Group member successfully created. Returns the group member.' })
  @UserRequired()
  @ValidateBody(groupMemberSchema)
  async createGroupMember(ctx: Context<User>) {
    const groupMember = await getRepository(GroupMember).save(
      getGroupMemberParams(ctx.request.body, 'default')
    );
    return new HttpResponseCreated(groupMember);
  }

  @Patch('/:groupMemberId')
  @ApiOperationId('modifyGroupMember')
  @ApiOperationSummary('Update/modify an existing group member.')
  @ApiResponse(400, { description: 'Invalid group member.' })
  @ApiResponse(404, { description: 'Group member not found.' })
  @ApiResponse(200, { description: 'Group member successfully updated. Returns the group member.' })
  @UserRequired()
  @ValidatePathParam('groupMemberId', { type: 'number' })
  @ValidateBody({ ...groupMemberSchema, required: [] })
  async modifyGroupMember(ctx: Context<User>) {
    const groupMember = await getRepository(GroupMember).findOne({
      id: ctx.request.params.groupMemberId
    });

    if (!groupMember) {
      return new HttpResponseNotFound();
    }

    Object.assign(groupMember, getGroupMemberParams(ctx.request.body, 'remove'));

    await getRepository(GroupMember).save(groupMember);

    return new HttpResponseOK(groupMember);
  }

  @Put('/:groupMemberId')
  @ApiOperationId('replaceGroupMember')
  @ApiOperationSummary('Update/replace an existing group member.')
  @ApiResponse(400, { description: 'Invalid group member.' })
  @ApiResponse(404, { description: 'Group member not found.' })
  @ApiResponse(200, { description: 'Group member successfully updated. Returns the group member.' })
  @UserRequired()
  @ValidatePathParam('groupMemberId', { type: 'number' })
  @ValidateBody(groupMemberSchema)
  async replaceGroupMember(ctx: Context<User>) {
    const groupMember = await getRepository(GroupMember).findOne({
      id: ctx.request.params.groupMemberId
    });

    if (!groupMember) {
      return new HttpResponseNotFound();
    }

    Object.assign(groupMember, getGroupMemberParams(ctx.request.body, 'default'));

    await getRepository(GroupMember).save(groupMember);

    return new HttpResponseOK(groupMember);
  }

  @Delete('/:groupMemberId')
  @ApiOperationId('deleteGroupMember')
  @ApiOperationSummary('Delete a group member.')
  @ApiResponse(404, { description: 'Group member not found.' })
  @ApiResponse(204, { description: 'Group member successfully deleted.' })
  @UserRequired()
  @ValidatePathParam('groupMemberId', { type: 'number' })
  async deleteGroupMember(ctx: Context<User>) {
    const groupMember = await getRepository(GroupMember).findOne({
      id: ctx.request.params.groupMemberId
    });

    if (!groupMember) {
      return new HttpResponseNotFound();
    }

    await getRepository(GroupMember).delete(ctx.request.params.groupMemberId);

    return new HttpResponseNoContent();
  }

}
