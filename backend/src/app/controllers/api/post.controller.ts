import {
  ApiDefineTag,
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post as HTTPPost,
  Put, UserRequired, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';
import { getRepository } from 'typeorm';

import { Post, User } from '../../entities';
import { ValidateQuery } from '../../hooks';
import { removeEmptyParams } from '../../utils';

const postSchema = {
  additionalProperties: false,
  properties: {
    authorID: { type: 'number' },
    parentID: {
      description: 'If this post is a comment, the id of the parent post that you are commenting on. ' +
        'The API will automatically increment or decrement the commentCount in the parent record as appropriate',
      oneOf: [{ type: 'number' }, { type: 'null' }]
    },
    content: { type: 'string' },
    type: {
      type: 'string',
      description: 'Implementation specific field to define types of posts; this could be "post", ' +
        '"comment", "blog", "essay", ' +
        'etc. - whatever makes sense for your platform.'
    },
    thumbnailURL: {
      type: 'string',
      description: 'If you have thumbnail images, this is the URL to the thumbnail for this post.'
    },
  },
  required: [ 'authorID' ],
  type: 'object',
}

function getPostParams(params: any, undefinedMode: 'remove' | 'default') {
  const resetDefaults = undefinedMode === 'default';

  const res = {
    author: {
      id: params.authorID
    },
    parent: {
      id: resetDefaults ? params.parentID ?? null : params.parentID
    },
    type: resetDefaults ? params.type ?? '' : params.type,
    content: resetDefaults ? params.content ?? '' : params.content,
    thumbnailURL: resetDefaults ? params.thumbnailURL ?? '' : params.thumbnailURL
  }

  return undefinedMode === 'remove' ? removeEmptyParams(res) : res;
}

@ApiDefineTag({
  name: 'Post',
  description: 'The heart of any social media site is the posts that the users create. This dataset will contain ' +
    'the post data, and also any comments for those posts. This is handled in the DB via the Materialized Path ' +
    'pattern (aka Path Enumeration) where a path is stored on each post noting its chain of ancestors. ' +
    'For more information, see https://www.slideshare.net/billkarwin/models-for-hierarchical-data. ' +
    'Adding a comment will automatically update the parent post as well, to increment the commentCount field. ' +
    'Tags (like, +1, etc) will be handled separately (Post Tags).'
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
    const posts = await getRepository(Post).findAndCount({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: getPostParams(ctx.request.query, 'remove')
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
      id: ctx.request.params.postId
    });

    if (!post) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(post);
  }

  @HTTPPost()
  @ApiOperationId('createPost')
  @ApiOperationSummary('Create a new post.')
  @ApiResponse(400, { description: 'Invalid post.' })
  @ApiResponse(201, { description: 'Post successfully created. Returns the post.' })
  @UserRequired()
  @ValidateBody(postSchema)
  async createPost(ctx: Context<User>) {
    const post: Post = await getRepository(Post).save(
      getPostParams(ctx.request.body, 'default')
    );
    if (post.parent) await getRepository(Post).increment(post, 'commentCount', 1);
    return new HttpResponseCreated(post);
  }

  @Patch('/:postId')
  @ApiOperationId('modifyPost')
  @ApiOperationSummary('Update/modify an existing post.')
  @ApiResponse(400, { description: 'Invalid post.' })
  @ApiResponse(404, { description: 'Post not found.' })
  @UserRequired()
  @ApiResponse(200, { description: 'Post successfully updated. Returns the post.' })
  @ValidatePathParam('postId', { type: 'number' })
  @ValidateBody({ ...postSchema, required: [] })
  async modifyPost(ctx: Context<User>) {
    const post = await getRepository(Post).findOne({
      id: ctx.request.params.postId
    });

    if (!post) {
      return new HttpResponseNotFound();
    }

    const oldParent = post.parent;

    Object.assign(post, getPostParams(ctx.request.body, 'remove'));

    await getRepository(Post).save(post);

    if (
      oldParent?.id !== post.parent?.id
      // I'm not positive what will happen if the user doesn't provide an updated parent ID
      // after we save, so I'm just going to be extra safe here
      // TODO: Verify actual behavior
      && !(post.parent?.id === undefined && (oldParent === null || oldParent?.id === null))
    ) {
      if (post.parent && post.parent.id) getRepository(Post).increment(post.parent, 'commentCount', 1);
      if (oldParent && oldParent.id) getRepository(Post).decrement(oldParent, 'commentCount', 1);
    }

    return new HttpResponseOK(post);
  }

  @Put('/:postId')
  @ApiOperationId('replacePost')
  @ApiOperationSummary('Update/replace an existing post.')
  @ApiResponse(400, { description: 'Invalid post.' })
  @ApiResponse(404, { description: 'Post not found.' })
  @ApiResponse(200, { description: 'Post successfully updated. Returns the post.' })
  @UserRequired()
  @ValidatePathParam('postId', { type: 'number' })
  @ValidateBody(postSchema)
  async replacePost(ctx: Context<User>) {
    const post = await getRepository(Post).findOne({
      id: ctx.request.params.postId,
      author: ctx.user
    });

    if (!post) {
      return new HttpResponseNotFound();
    }

    const oldParent = post.parent;

    Object.assign(post, getPostParams(ctx.request.body, 'default'));

    if (
      oldParent?.id !== post.parent?.id
      // I'm not positive what will happen if this was blank before and we provide an explicit null
      // after we save, so I'm just going to be extra safe here
      // TODO: Verify actual behavior
      && !(oldParent?.id === undefined && (post.parent === null || post.parent?.id === null))
    ) {
      if (post.parent && post.parent.id) getRepository(Post).increment(post.parent, 'commentCount', 1);
      if (oldParent && oldParent.id) getRepository(Post).decrement(oldParent, 'commentCount', 1);
    }

    await getRepository(Post).save(post);

    return new HttpResponseOK(post);
  }

  @Delete('/:postId')
  @ApiOperationId('deletePost')
  @ApiOperationSummary('Delete a post.')
  @ApiResponse(404, { description: 'Post not found.' })
  @ApiResponse(204, { description: 'Post successfully deleted.' })
  @UserRequired()
  @ValidatePathParam('postId', { type: 'number' })
  async deletePost(ctx: Context<User>) {
    const post = await getRepository(Post).findOne({
      id: ctx.request.params.postId
    });

    if (!post) {
      return new HttpResponseNotFound();
    }

    const parent = post.parent;

    await getRepository(Post).delete(ctx.request.params.postId);

    // TODO: Is the parent.id check redundant?
    if (parent && parent.id) getRepository(Post).decrement(parent, 'commentCount', 1)

    return new HttpResponseNoContent();
  }

}
