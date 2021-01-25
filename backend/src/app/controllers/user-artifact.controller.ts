import {
  ApiDefineTag,
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';
import { getRepository } from 'typeorm';

import { UserArtifact, User } from '../entities';

const userArtifactSchema = {
  additionalProperties: false,
  properties: {
    type: {
      type: 'string',
      description: `
        Implementation specific field to define types of artifacts; this could be "picture",
        "document", "title" - whatever makes sense for your system.
      `
    },
    url: {
      type: 'string',
      description: `
        The path to the artifact; it could be a local path if the artifact is an uploaded file,
        or a full URL if it is a link to a remote artifact
      `
    },
    category: {
      type: 'string',
      description: `
        Implementation specific field to categorize artifacts; this could be "profile pictures",
        or "favorite posts" or "associated accounts" - whatever makes sense for your system.
      `
    }
  },
  required: [ ],
  type: 'object',
};

@ApiDefineTag({
  name: 'User Artifact',
  description: `
    This is an implementation specific dataset that can hold any additional information or data
    for a particular user in a categorizable way. This could be a profile picture, birthday,
    timeline photo, job title, etc.
  `
})
@ApiUseTag('User Artifact')
export class UserArtifactController {

  @Get()
  @ApiOperationId('findUserArtifacts')
  @ApiOperationSummary('Find user artifacts.')
  @ApiOperationDescription(
    'The query parameters "skip" and "take" can be used for pagination. The first ' +
    'is the offset and the second is the number of elements to be returned.'
  )
  @ApiResponse(400, { description: 'Invalid query parameters.' })
  @ApiResponse(200, { description: 'Returns a list of user artifacts.' })
  @ValidateQueryParam('skip', { type: 'number' }, { required: false })
  @ValidateQueryParam('take', { type: 'number' }, { required: false })
  @ValidateQueryParam('userID', { type: 'number' }, { required: false })
  @ValidateQueryParam('type', { type: 'string' }, { required: false })
  @ValidateQueryParam('url', { type: 'string' }, { required: false })
  @ValidateQueryParam('category', { type: 'string' }, { required: false })
  async findUserArtifacts(ctx: Context<User>) {
    const userArtifacts = await getRepository(UserArtifact).find({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: {
        owner: {
          id: ctx.request.query.userID
        },
        type: ctx.request.query.type,
        url: ctx.request.query.url,
        category: ctx.request.query.category
      }
    });
    return new HttpResponseOK(userArtifacts);
  }

  @Get('/:userArtifactId')
  @ApiOperationId('findUserArtifactById')
  @ApiOperationSummary('Find a user artifact by ID.')
  @ApiResponse(404, { description: 'User artifact not found.' })
  @ApiResponse(200, { description: 'Returns the user artifact.' })
  @ValidatePathParam('userArtifactId', { type: 'number' })
  async findUserArtifactById(ctx: Context<User>) {
    const userArtifact = await getRepository(UserArtifact).findOne({
      id: ctx.request.params.userArtifactId,
      owner: ctx.user
    });

    if (!userArtifact) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(userArtifact);
  }

  @Post()
  @ApiOperationId('createUserArtifact')
  @ApiOperationSummary('Create a new user artifact.')
  @ApiResponse(400, { description: 'Invalid user artifact.' })
  @ApiResponse(201, { description: 'UserArtifact successfully created. Returns the user artifact.' })
  @ValidateBody(userArtifactSchema)
  async createUserArtifact(ctx: Context<User>) {
    const userArtifact = await getRepository(UserArtifact).save({
      ...ctx.request.body,
      owner: ctx.user
    });
    return new HttpResponseCreated(userArtifact);
  }

  @Patch('/:userArtifactId')
  @ApiOperationId('modifyUserArtifact')
  @ApiOperationSummary('Update/modify an existing user artifact.')
  @ApiResponse(400, { description: 'Invalid user artifact.' })
  @ApiResponse(404, { description: 'UserArtifact not found.' })
  @ApiResponse(200, { description: 'UserArtifact successfully updated. Returns the user artifact.' })
  @ValidatePathParam('userArtifactId', { type: 'number' })
  @ValidateBody({ ...userArtifactSchema, required: [] })
  async modifyUserArtifact(ctx: Context<User>) {
    const userArtifact = await getRepository(UserArtifact).findOne({
      id: ctx.request.params.userArtifactId,
      owner: ctx.user
    });

    if (!userArtifact) {
      return new HttpResponseNotFound();
    }

    Object.assign(userArtifact, ctx.request.body);

    await getRepository(UserArtifact).save(userArtifact);

    return new HttpResponseOK(userArtifact);
  }

  @Put('/:userArtifactId')
  @ApiOperationId('replaceUserArtifact')
  @ApiOperationSummary('Update/replace an existing user artifact.')
  @ApiResponse(400, { description: 'Invalid user artifact.' })
  @ApiResponse(404, { description: 'UserArtifact not found.' })
  @ApiResponse(200, { description: 'UserArtifact successfully updated. Returns the user artifact.' })
  @ValidatePathParam('userArtifactId', { type: 'number' })
  @ValidateBody(userArtifactSchema)
  async replaceUserArtifact(ctx: Context<User>) {
    const userArtifact = await getRepository(UserArtifact).findOne({
      id: ctx.request.params.userArtifactId,
      owner: ctx.user
    });

    if (!userArtifact) {
      return new HttpResponseNotFound();
    }

    Object.assign(userArtifact, ctx.request.body);

    await getRepository(UserArtifact).save(userArtifact);

    return new HttpResponseOK(userArtifact);
  }

  @Delete('/:userArtifactId')
  @ApiOperationId('deleteUserArtifact')
  @ApiOperationSummary('Delete a user artifact.')
  @ApiResponse(404, { description: 'User artifact not found.' })
  @ApiResponse(204, { description: 'User artifact successfully deleted.' })
  @ValidatePathParam('userArtifactId', { type: 'number' })
  async deleteUserArtifact(ctx: Context<User>) {
    const userArtifact = await getRepository(UserArtifact).findOne({
      id: ctx.request.params.userArtifactId,
      owner: ctx.user
    });

    if (!userArtifact) {
      return new HttpResponseNotFound();
    }

    await getRepository(UserArtifact).delete(ctx.request.params.userArtifactId);

    return new HttpResponseNoContent();
  }

}
