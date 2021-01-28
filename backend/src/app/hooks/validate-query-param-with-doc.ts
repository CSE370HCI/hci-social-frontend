import { ApiParameter, HookDecorator, MergeHooks, ValidateQueryParam } from '@foal/core';

export function ValidateQueryParamWithDoc(name: string, schema: object, {
    required,
    description
}: {
    required?: boolean,
    description?: string
}): HookDecorator {
  return MergeHooks(
    ValidateQueryParam(name, schema, { openapi: false, required }),
    ApiParameter({ in: 'query', name, schema, description, required })
  );
}
