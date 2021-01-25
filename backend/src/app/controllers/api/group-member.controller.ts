import {
  ApiDefineTag,
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';
import { getRepository } from 'typeorm';

import { GroupMember, User } from '../../entities';
import { ValidateQuery } from '../../hooks';

const groupMemberSchema = {
  additionalProperties: false,
  properties: {
    groupID: { type: 'number' },
    type: {
      type: 'string',
      description: 'Implementation specific field to allow you to break members up into subcategories; ' +
        'could be "organizer" and "attendee" or "admin" and "user" - whatever ' +
        'makes sense to your platform.'
    },
  },
  required: [ 'groupID' ],
  type: 'object',
};

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
  @ValidateQueryParam('userID', { type: 'number' }, { required: false })
  @ValidateQuery({...groupMemberSchema, required: []})
  async findGroupMembers(ctx: Context<User>) {
    const groupMembers = await getRepository(GroupMember).find({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: {
        owner: {
          id: ctx.request.query.userID
        },
        group: {
          id: ctx.request.query.groupID
        },
        type: ctx.request.query.type
      }
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
      id: ctx.request.params.groupMemberId,
      owner: ctx.user
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
  @ValidateBody(groupMemberSchema)
  async createGroupMember(ctx: Context<User>) {
    const { groupID, ...body } = ctx.request.body;
    const groupMember = await getRepository(GroupMember).save({
      ...body,
      group: {
        id: groupID
      },
      owner: ctx.user
    });
    return new HttpResponseCreated(groupMember);
  }

  @Patch('/:groupMemberId')
  @ApiOperationId('modifyGroupMember')
  @ApiOperationSummary('Update/modify an existing group member.')
  @ApiResponse(400, { description: 'Invalid group member.' })
  @ApiResponse(404, { description: 'Group member not found.' })
  @ApiResponse(200, { description: 'Group member successfully updated. Returns the group member.' })
  @ValidatePathParam('groupMemberId', { type: 'number' })
  @ValidateBody({ ...groupMemberSchema, required: [] })
  async modifyGroupMember(ctx: Context<User>) {
    const groupMember = await getRepository(GroupMember).findOne({
      id: ctx.request.params.groupMemberId,
      owner: ctx.user
    });

    if (!groupMember) {
      return new HttpResponseNotFound();
    }

    const { groupID, ...body } = ctx.request.body;
    Object.assign(groupMember, body);
    if (groupID) groupMember.group.id = groupID;

    await getRepository(GroupMember).save(groupMember);

    return new HttpResponseOK(groupMember);
  }

  @Put('/:groupMemberId')
  @ApiOperationId('replaceGroupMember')
  @ApiOperationSummary('Update/replace an existing group member.')
  @ApiResponse(400, { description: 'Invalid group member.' })
  @ApiResponse(404, { description: 'Group member not found.' })
  @ApiResponse(200, { description: 'Group member successfully updated. Returns the group member.' })
  @ValidatePathParam('groupMemberId', { type: 'number' })
  @ValidateBody(groupMemberSchema)
  async replaceGroupMember(ctx: Context<User>) {
    const groupMember = await getRepository(GroupMember).findOne({
      id: ctx.request.params.groupMemberId,
      owner: ctx.user
    });

    if (!groupMember) {
      return new HttpResponseNotFound();
    }

    const { groupID, ...body } = ctx.request.body;
    Object.assign(groupMember, body);
    groupMember.group.id = groupID;

    await getRepository(GroupMember).save(groupMember);

    return new HttpResponseOK(groupMember);
  }

  @Delete('/:groupMemberId')
  @ApiOperationId('deleteGroupMember')
  @ApiOperationSummary('Delete a group member.')
  @ApiResponse(404, { description: 'Group member not found.' })
  @ApiResponse(204, { description: 'Group member successfully deleted.' })
  @ValidatePathParam('groupMemberId', { type: 'number' })
  async deleteGroupMember(ctx: Context<User>) {
    const groupMember = await getRepository(GroupMember).findOne({
      id: ctx.request.params.groupMemberId,
      owner: ctx.user
    });

    if (!groupMember) {
      return new HttpResponseNotFound();
    }

    await getRepository(GroupMember).delete(ctx.request.params.groupMemberId);

    return new HttpResponseNoContent();
  }

}
