import {
  ApiDefineTag,
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post as HTTPPost,
  Put, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';
import { getRepository, getTreeRepository } from 'typeorm';

import { Post, User } from '../entities';
import { ValidateQuery } from '../hooks';

const postSchema = {
  additionalProperties: false,
  properties: {
    type: {
      type: 'string',
      description: `
        Implementation specific field to define types of posts; this could be "post", "comment", "blog", "essay",
        etc. - whatever makes sense for your platform.
      `
    },
    content: { type: 'string' },
    thumbnailURL: {
      type: 'string',
      description: 'If you have thumbnail images, this is the URL to the thumbnail for this post.'
    },
    parentID: {
      type: 'number',
      description: `
        If this post is a comment, the id of the parent post that you are commenting on.
        For creates, if this field is set, the API call to add a post will automatically increment
        the commentCount in the parent record
      `
    },
  },
  required: [  ],
  type: 'object',
};

@ApiDefineTag({
  name: 'Post',
  description: `
    The heart of any social media site is the posts that the users create. This dataset will contain
    the post data, and also any comments for those posts. This is handled in the DB via the Materialized Path
    pattern (aka Path Enumeration) where a path is stored on each post noting its chain of ancestors.
    For more information, see https://www.slideshare.net/billkarwin/models-for-hierarchical-data.
    Adding a comment will automatically update the parent post as well, to increment the commentCount field.
    Tags (like, +1, etc) will be handled separately (Post Tags).
  `
})
@ApiUseTag('Post')
export class PostController {

  @Get()
  @ApiOperationId('findPosts')
  @ApiOperationSummary('Find posts.')
  @ApiOperationDescription(
    'The query parameters "skip" and "take" can be used for pagination. The first ' +
    'is the offset and the second is the number of elements to be returned.'
  )
  @ApiResponse(400, { description: 'Invalid query parameters.' })
  @ApiResponse(200, { description: 'Returns a list of posts.' })
  @ValidateQueryParam('skip', { type: 'number' }, { required: false })
  @ValidateQueryParam('take', { type: 'number' }, { required: false })
  @ValidateQueryParam('userID', { type: 'number' }, { required: false })
  @ValidateQuery({...postSchema, required: []})
  async findPosts(ctx: Context<User>) {
    const posts = await getRepository(Post).find({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: {
        owner: {
          id: ctx.request.query.userID
        },
        parent: {
          id: ctx.request.query.parentID
        },
      }
    });
    return new HttpResponseOK(posts);
  }

  @Get('/:postId')
  @ApiOperationId('findPostById')
  @ApiOperationSummary('Find a post by ID.')
  @ApiResponse(404, { description: 'Post not found.' })
  @ApiResponse(200, { description: 'Returns the post.' })
  @ValidatePathParam('postId', { type: 'number' })
  async findPostById(ctx: Context<User>) {
    const post = await getRepository(Post).findOne({
      id: ctx.request.params.postId,
      owner: ctx.user
    });

    if (!post) {
      return new HttpResponseNotFound();
    }

    const tree = getTreeRepository(Post).findDescendantsTree(post);

    return new HttpResponseOK(tree);
  }

  @HTTPPost()
  @ApiOperationId('createPost')
  @ApiOperationSummary('Create a new post.')
  @ApiResponse(400, { description: 'Invalid post.' })
  @ApiResponse(201, { description: 'Post successfully created. Returns the post.' })
  @ValidateBody(postSchema)
  async createPost(ctx: Context<User>) {
    const post: Post = await getRepository(Post).save({
      ...ctx.request.body,
      owner: ctx.user
    });
    if (post.parent) await getRepository(Post).increment(post, 'commentCount', 1);
    return new HttpResponseCreated(post);
  }

  @Patch('/:postId')
  @ApiOperationId('modifyPost')
  @ApiOperationSummary('Update/modify an existing post.')
  @ApiResponse(400, { description: 'Invalid post.' })
  @ApiResponse(404, { description: 'Post not found.' })
  @ApiResponse(200, { description: 'Post successfully updated. Returns the post.' })
  @ValidatePathParam('postId', { type: 'number' })
  @ValidateBody({ ...postSchema, required: [] })
  async modifyPost(ctx: Context<User>) {
    const post = await getRepository(Post).findOne({
      id: ctx.request.params.postId,
      owner: ctx.user
    });

    if (!post) {
      return new HttpResponseNotFound();
    }

    Object.assign(post, ctx.request.body);

    await getRepository(Post).save(post);

    return new HttpResponseOK(post);
  }

  @Put('/:postId')
  @ApiOperationId('replacePost')
  @ApiOperationSummary('Update/replace an existing post.')
  @ApiResponse(400, { description: 'Invalid post.' })
  @ApiResponse(404, { description: 'Post not found.' })
  @ApiResponse(200, { description: 'Post successfully updated. Returns the post.' })
  @ValidatePathParam('postId', { type: 'number' })
  @ValidateBody(postSchema)
  async replacePost(ctx: Context<User>) {
    const post = await getRepository(Post).findOne({
      id: ctx.request.params.postId,
      owner: ctx.user
    });

    if (!post) {
      return new HttpResponseNotFound();
    }

    Object.assign(post, ctx.request.body);

    await getRepository(Post).save(post);

    return new HttpResponseOK(post);
  }

  @Delete('/:postId')
  @ApiOperationId('deletePost')
  @ApiOperationSummary('Delete a post.')
  @ApiResponse(404, { description: 'Post not found.' })
  @ApiResponse(204, { description: 'Post successfully deleted.' })
  @ValidatePathParam('postId', { type: 'number' })
  async deletePost(ctx: Context<User>) {
    const post = await getRepository(Post).findOne({
      id: ctx.request.params.postId,
      owner: ctx.user
    });

    if (!post) {
      return new HttpResponseNotFound();
    }

    await getRepository(Post).delete(ctx.request.params.postId);

    return new HttpResponseNoContent();
  }

}
