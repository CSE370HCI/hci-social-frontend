import {
  ApiDefineTag,
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';
import { getRepository } from 'typeorm';

import { PostTag, User } from '../../entities';
import { ValidateQuery } from '../../hooks';

const postTagSchema = {
  additionalProperties: false,
  properties: {
    postID: { type: 'number' },
    name: {
      type: 'string',
      description: 'Implementation specific field for the tag itself; this might be "like" or "sad" or "offtopic"'
    },
    type: {
      type: 'string',
      description:  `
        Implementation specific field for categorizing tags; you may want to have both
        "likes" and "upvotes" - having the tag type allows you to do both.
      `
    }
  },
  required: [ 'postID', 'name' ],
  type: 'object',
};

@ApiDefineTag({
  name: 'Post Tag',
  description: `
    This is an implementation specific dataset that will handle any tags that are applied to posts in your system.
    This could be like/dislike, or some sort of semantic tagging (offtopic, insightful, etc) - any
    specific set of values that users can apply to posts.
  `
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
  @ValidateQueryParam('userID', { type: 'number' }, { required: false })
  @ValidateQuery({...postTagSchema, required: []})
  async findPostTags(ctx: Context<User>) {
    const postTags = await getRepository(PostTag).find({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: {
        owner: {
          id: ctx.request.query.userID
        },
        post: {
          id: ctx.request.query.postID
        },
        name: ctx.request.query.name,
        type: ctx.request.query.type
      }
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
      id: ctx.request.params.postTagId,
      owner: ctx.user
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
  @ValidateBody(postTagSchema)
  async createPostTag(ctx: Context<User>) {
    const { postID, ...body } = ctx.request.body;
    const postTag = await getRepository(PostTag).save({
      ...body,
      post: {
        id: postID
      },
      owner: ctx.user
    });
    return new HttpResponseCreated(postTag);
  }

  @Patch('/:postTagId')
  @ApiOperationId('modifyPostTag')
  @ApiOperationSummary('Update/modify an existing post tag.')
  @ApiResponse(400, { description: 'Invalid post tag.' })
  @ApiResponse(404, { description: 'PostTag not found.' })
  @ApiResponse(200, { description: 'PostTag successfully updated. Returns the post tag.' })
  @ValidatePathParam('postTagId', { type: 'number' })
  @ValidateBody({ ...postTagSchema, required: [] })
  async modifyPostTag(ctx: Context<User>) {
    const postTag = await getRepository(PostTag).findOne({
      id: ctx.request.params.postTagId,
      owner: ctx.user
    });

    if (!postTag) {
      return new HttpResponseNotFound();
    }

    const { postID, ...body } = ctx.request.body;
    Object.assign(postTag, body);
    if (postID) postTag.post.id = postID;

    await getRepository(PostTag).save(postTag);

    return new HttpResponseOK(postTag);
  }

  @Put('/:postTagId')
  @ApiOperationId('replacePostTag')
  @ApiOperationSummary('Update/replace an existing post tag.')
  @ApiResponse(400, { description: 'Invalid post tag.' })
  @ApiResponse(404, { description: 'PostTag not found.' })
  @ApiResponse(200, { description: 'PostTag successfully updated. Returns the post tag.' })
  @ValidatePathParam('postTagId', { type: 'number' })
  @ValidateBody(postTagSchema)
  async replacePostTag(ctx: Context<User>) {
    const postTag = await getRepository(PostTag).findOne({
      id: ctx.request.params.postTagId,
      owner: ctx.user
    });

    if (!postTag) {
      return new HttpResponseNotFound();
    }

    const { postID, ...body } = ctx.request.body;
    Object.assign(postTag, body);
    postTag.post.id = postID;

    await getRepository(PostTag).save(postTag);

    return new HttpResponseOK(postTag);
  }

  @Delete('/:postTagId')
  @ApiOperationId('deletePostTag')
  @ApiOperationSummary('Delete a post tag.')
  @ApiResponse(404, { description: 'PostTag not found.' })
  @ApiResponse(204, { description: 'PostTag successfully deleted.' })
  @ValidatePathParam('postTagId', { type: 'number' })
  async deletePostTag(ctx: Context<User>) {
    const postTag = await getRepository(PostTag).findOne({
      id: ctx.request.params.postTagId,
      owner: ctx.user
    });

    if (!postTag) {
      return new HttpResponseNotFound();
    }

    await getRepository(PostTag).delete(ctx.request.params.postTagId);

    return new HttpResponseNoContent();
  }

}
