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
      description: 'If this post is a comment, the id of the parent post that you are commenting on.',
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

enum Sort {
  OLDEST = 'oldest',
  NEWEST = 'newest'
}

function getOrderBy(sort: Sort) {
  switch (sort) {
    case Sort.OLDEST:
      return { 'post.createdAt': 'ASC' as 'ASC' };
    case Sort.NEWEST:
      return { 'post.createdAt': 'DESC' as 'DESC' };
  }
}

@ApiDefineTag({
  name: 'Post',
  description: 'The heart of any social media site is the posts that the users create. This dataset will contain ' +
    'the post data, and also any comments for those posts. This is handled in the DB via the Materialized Path ' +
    'pattern (aka Path Enumeration) where a path is stored on each post noting its chain of ancestors. ' +
    'For more information, see https://www.slideshare.net/billkarwin/models-for-hierarchical-data. ' +
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
  @ValidateQueryParam('sort', { enum: Object.values(Sort), default: Sort.NEWEST }, { required: false })
  @ValidateQuery({...postSchema, required: []})
  async findPosts(ctx: Context<User>) {
    const query = getRepository(Post).createQueryBuilder('post')
      .select('post')
      .addSelect('author')
      .addSelect('parent.id')
      .addSelect((subQuery) => {
        return subQuery
            .select('COUNT(comment.id)')
            .from(Post, 'comment')
            .where('comment.parent.id = post.id');
        }, 'commentCount'
      )
      .leftJoin('post.author', 'author')
      .leftJoin('post.parent', 'parent')
      .where(getPostParams(ctx.request.query, 'remove'))
      .orderBy(getOrderBy(ctx.request.query.sort))
      .skip(ctx.request.query.skip)
      .take(ctx.request.query.take);

    const posts = await query.getRawAndEntities();

    const annotatedPosts = posts.entities.map((post, idx) => ({...post, commentCount: posts.raw[idx].commentCount }));

    return new HttpResponseOK([annotatedPosts, await query.getCount()]);
  }

  @Get('/:postId')
  @ApiOperationId('findPostById')
  @ApiOperationSummary('Find a post by ID.')
  @ApiResponse(404, { description: 'Post not found.' })
  @ApiResponse(200, { description: 'Returns the post.' })
  @ValidatePathParam('postId', { type: 'number' })
  async findPostById(ctx: Context<User>) {
    const post = await getRepository(Post).createQueryBuilder('post')
      .select('post')
      .addSelect('author')
      .addSelect('parent.id')
      .leftJoin('post.author', 'author')
      .leftJoin('post.parent', 'parent')
      .where({id: ctx.request.params.postId})
      .getOne();

    if (!post) {
      return new HttpResponseNotFound();
    }

    post.commentCount = await getRepository(Post).count({
      parent: {
        id: post.id
      }
    });

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

    return new HttpResponseNoContent();
  }

}
