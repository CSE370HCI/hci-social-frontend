import {
  ApiDefineTag,
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, UserRequired, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';
import { getRepository } from 'typeorm';

import { UserPreference, User } from '../../entities';
import { ValidateQuery } from '../../hooks';
import { removeEmptyParams } from '../../utils';

const userPreferenceSchema = {
  additionalProperties: false,
  properties: {
    userID: { type: 'number' },
    name: { type: 'string' },
    value: { type: 'string' },
  },
  required: [ 'userID', 'name', 'value' ],
  type: 'object',
};

function getUserPreferenceParams(params: any, undefinedMode: 'remove' | 'default') {
  const resetDefaults = undefinedMode === 'default';

  const res = {
    user: {
      id: params.userID
    },
    name: params.name,
    value: params.value
  }

  return undefinedMode === 'remove' ? removeEmptyParams(res) : res;
}

@ApiDefineTag({
  name: 'User Preference',
  description: 'This is an implementation specific dataset that can hold any generic user preferences ' +
    'that you want to define in a name value style way. This could be anything from how many results ' +
    'show up at a time in their feed to what language they want the site to display in to what timezone they\'re in.'
})
@ApiUseTag('User Preference')
export class UserPreferenceController {

  @Get()
  @ApiOperationId('findUserPreferences')
  @ApiOperationSummary('Find user preferences.')
  @ApiOperationDescription(
    'The query parameters "skip" and "take" can be used for pagination. The first ' +
    'is the offset and the second is the number of elements to be returned.'
  )
  @ApiResponse(400, { description: 'Invalid query parameters.' })
  @ApiResponse(200, { description: 'Returns a list of user preferences.' })
  @ValidateQueryParam('skip', { type: 'number' }, { required: false })
  @ValidateQueryParam('take', { type: 'number' }, { required: false })
  @ValidateQuery({...userPreferenceSchema, required: []})
  async findUserPreferences(ctx: Context<User>) {
    const userPreferences = await getRepository(UserPreference).findAndCount({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: getUserPreferenceParams(ctx.request.query, 'remove')
    });
    return new HttpResponseOK(userPreferences);
  }

  @Get('/:userPreferenceId')
  @ApiOperationId('findUserPreferenceById')
  @ApiOperationSummary('Find a user preference by ID.')
  @ApiResponse(404, { description: 'User preference not found.' })
  @ApiResponse(200, { description: 'Returns the user preference.' })
  @ValidatePathParam('userPreferenceId', { type: 'number' })
  async findUserPreferenceById(ctx: Context<User>) {
    const userPreference = await getRepository(UserPreference).findOne({
      id: ctx.request.params.userPreferenceId
    });

    if (!userPreference) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(userPreference);
  }

  @Post()
  @ApiOperationId('createUserPreference')
  @ApiOperationSummary('Create a new user preference.')
  @ApiResponse(400, { description: 'Invalid user preference.' })
  @ApiResponse(201, { description: 'User preference successfully created. Returns the user preference.' })
  @UserRequired()
  @ValidateBody(userPreferenceSchema)
  async createUserPreference(ctx: Context<User>) {
    const userPreference = await getRepository(UserPreference).save(
      getUserPreferenceParams(ctx.request.body, 'default')
    );
    return new HttpResponseCreated(userPreference);
  }

  @Patch('/:userPreferenceId')
  @ApiOperationId('modifyUserPreference')
  @ApiOperationSummary('Update/modify an existing user preference.')
  @ApiResponse(400, { description: 'Invalid user preference.' })
  @ApiResponse(404, { description: 'User preference not found.' })
  @ApiResponse(200, { description: 'User preference successfully updated. Returns the user preference.' })
  @UserRequired()
  @ValidatePathParam('userPreferenceId', { type: 'number' })
  @ValidateBody({ ...userPreferenceSchema, required: [] })
  async modifyUserPreference(ctx: Context<User>) {
    const userPreference = await getRepository(UserPreference).findOne({
      id: ctx.request.params.userPreferenceId
    });

    if (!userPreference) {
      return new HttpResponseNotFound();
    }

    Object.assign(userPreference, getUserPreferenceParams(ctx.request.body, 'remove'));

    await getRepository(UserPreference).save(userPreference);

    return new HttpResponseOK(userPreference);
  }

  @Put('/:userPreferenceId')
  @ApiOperationId('replaceUserPreference')
  @ApiOperationSummary('Update/replace an existing user preference.')
  @ApiResponse(400, { description: 'Invalid user preference.' })
  @ApiResponse(404, { description: 'User preference not found.' })
  @ApiResponse(200, { description: 'User preference successfully updated. Returns the user preference.' })
  @UserRequired()
  @ValidatePathParam('userPreferenceId', { type: 'number' })
  @ValidateBody(userPreferenceSchema)
  async replaceUserPreference(ctx: Context<User>) {
    const userPreference = await getRepository(UserPreference).findOne({
      id: ctx.request.params.userPreferenceId
    });

    if (!userPreference) {
      return new HttpResponseNotFound();
    }

    Object.assign(userPreference, getUserPreferenceParams(ctx.request.body, 'default'));

    await getRepository(UserPreference).save(userPreference);

    return new HttpResponseOK(userPreference);
  }

  @Delete('/:userPreferenceId')
  @ApiOperationId('deleteUserPreference')
  @ApiOperationSummary('Delete a user preference.')
  @ApiResponse(404, { description: 'User preference not found.' })
  @ApiResponse(204, { description: 'User preference successfully deleted.' })
  @UserRequired()
  @ValidatePathParam('userPreferenceId', { type: 'number' })
  async deleteUserPreference(ctx: Context<User>) {
    const userPreference = await getRepository(UserPreference).findOne({
      id: ctx.request.params.userPreferenceId
    });

    if (!userPreference) {
      return new HttpResponseNotFound();
    }

    await getRepository(UserPreference).delete(ctx.request.params.userPreferenceId);

    return new HttpResponseNoContent();
  }

}
