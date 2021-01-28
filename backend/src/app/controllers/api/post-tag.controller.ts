import {
  ApiDefineTag,
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, UserRequired, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';
import { getRepository } from 'typeorm';

import { PostTag, User } from '../../entities';
import { ValidateQuery } from '../../hooks';
import { removeEmptyParams } from '../../utils';

const postTagSchema = {
  additionalProperties: false,
  properties: {
    postID: { type: 'number' },
    userID: {
      description: 'The user that added the tag/that the tag is applicable for. If you want to create ' +
        'a "system" tag, you might want to set this to `null`',
      oneOf: [{ type: 'number' }, { type: 'null' }]
    },
    name: {
      type: 'string',
      description: 'Implementation specific field for the tag itself; this might be "like" or "sad" or "offtopic"'
    },
    type: {
      type: 'string',
      description:  'Implementation specific field for categorizing tags; you may want to have both ' +
        '"likes" and "upvotes" - having the tag type allows you to do both.'
    }
  },
  required: [ 'postID' ],
  type: 'object',
};

function getPostTagParams(params: any, undefinedMode: 'remove' | 'default') {
  const resetDefaults = undefinedMode === 'default';

  const res = {
    post: {
      id: params.postID
    },
    user: {
      id: resetDefaults ? params.userID ?? null : params.userID
    },
    name: resetDefaults ? params.name ?? '' : params.name,
    type: resetDefaults ? params.type ?? '' : params.type
  }

  return undefinedMode === 'remove' ? removeEmptyParams(res) : res;
}

@ApiDefineTag({
  name: 'Post Tag',
  description: 'This is an implementation specific dataset that will handle any tags that are applied to posts in your system. ' +
    'This could be like/dislike, or some sort of semantic tagging (offtopic, insightful, etc) - any ' +
    'specific set of values that users can apply to posts.'
})
@ApiUseTag('Post Tag')
export class PostTagController {

  @Get()
  @ApiOperationId('findPostTags')
  @ApiOperationSummary('Find post tags.')
  @ApiOperationDescription(
    'The query parameters "skip" and "take" can be used for pagination. The first ' +
    'is the offset and the second is the number of elements to be returned.'
  )
  @ApiResponse(400, { description: 'Invalid query parameters.' })
  @ApiResponse(200, { description: 'Returns a list of post tags.' })
  @ValidateQueryParam('skip', { type: 'number' }, { required: false })
  @ValidateQueryParam('take', { type: 'number' }, { required: false })
  @ValidateQuery({...postTagSchema, required: []})
  async findPostTags(ctx: Context<User>) {
    const postTags = await getRepository(PostTag).findAndCount({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: getPostTagParams(ctx.request.query, 'remove')
    });
    return new HttpResponseOK(postTags);
  }

  @Get('/:postTagId')
  @ApiOperationId('findPostTagById')
  @ApiOperationSummary('Find a post tag by ID.')
  @ApiResponse(404, { description: 'Post tag not found.' })
  @ApiResponse(200, { description: 'Returns the post tag.' })
  @ValidatePathParam('postTagId', { type: 'number' })
  async findPostTagById(ctx: Context<User>) {
    const postTag = await getRepository(PostTag).findOne({
      id: ctx.request.params.postTagId
    });

    if (!postTag) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(postTag);
  }

  @Post()
  @ApiOperationId('createPostTag')
  @ApiOperationSummary('Create a new post tag.')
  @ApiResponse(400, { description: 'Invalid post tag.' })
  @ApiResponse(201, { description: 'PostTag successfully created. Returns the post tag.' })
  @UserRequired()
  @ValidateBody(postTagSchema)
  async createPostTag(ctx: Context<User>) {
    const { postID, ...body } = ctx.request.body;
    const postTag = await getRepository(PostTag).save(
      getPostTagParams(ctx.request.body, 'default')
    );
    return new HttpResponseCreated(postTag);
  }

  @Patch('/:postTagId')
  @ApiOperationId('modifyPostTag')
  @ApiOperationSummary('Update/modify an existing post tag.')
  @ApiResponse(400, { description: 'Invalid post tag.' })
  @ApiResponse(404, { description: 'PostTag not found.' })
  @ApiResponse(200, { description: 'PostTag successfully updated. Returns the post tag.' })
  @UserRequired()
  @ValidatePathParam('postTagId', { type: 'number' })
  @ValidateBody({ ...postTagSchema, required: [] })
  async modifyPostTag(ctx: Context<User>) {
    const postTag = await getRepository(PostTag).findOne({
      id: ctx.request.params.postTagId
    });

    if (!postTag) {
      return new HttpResponseNotFound();
    }

    Object.assign(postTag, getPostTagParams(ctx.request.body, 'remove'));

    await getRepository(PostTag).save(postTag);

    return new HttpResponseOK(postTag);
  }

  @Put('/:postTagId')
  @ApiOperationId('replacePostTag')
  @ApiOperationSummary('Update/replace an existing post tag.')
  @ApiResponse(400, { description: 'Invalid post tag.' })
  @ApiResponse(404, { description: 'PostTag not found.' })
  @ApiResponse(200, { description: 'PostTag successfully updated. Returns the post tag.' })
  @UserRequired()
  @ValidatePathParam('postTagId', { type: 'number' })
  @ValidateBody(postTagSchema)
  async replacePostTag(ctx: Context<User>) {
    const postTag = await getRepository(PostTag).findOne({
      id: ctx.request.params.postTagId
    });

    if (!postTag) {
      return new HttpResponseNotFound();
    }

    Object.assign(postTag, getPostTagParams(ctx.request.body, 'default'));

    await getRepository(PostTag).save(postTag);

    return new HttpResponseOK(postTag);
  }

  @Delete('/:postTagId')
  @ApiOperationId('deletePostTag')
  @ApiOperationSummary('Delete a post tag.')
  @ApiResponse(404, { description: 'PostTag not found.' })
  @ApiResponse(204, { description: 'PostTag successfully deleted.' })
  @UserRequired()
  @ValidatePathParam('postTagId', { type: 'number' })
  async deletePostTag(ctx: Context<User>) {
    const postTag = await getRepository(PostTag).findOne({
      id: ctx.request.params.postTagId
    });

    if (!postTag) {
      return new HttpResponseNotFound();
    }

    await getRepository(PostTag).delete(ctx.request.params.postTagId);

    return new HttpResponseNoContent();
  }

}
