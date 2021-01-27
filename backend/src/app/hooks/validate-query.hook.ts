import { HookDecorator, MergeHooks, ValidateQueryParam } from '@foal/core';
import { ValidateQueryParamWithDoc } from './validate-query-param-with-doc';

export function ValidateQuery(schema: Record<string, any>): HookDecorator {
  return MergeHooks(
    ...Object.keys(schema.properties).map(
      name => ValidateQueryParamWithDoc(name, schema.properties[name], {
        required: schema.required.includes(name),
        description: schema.properties[name].description
      })
    )
  );
}
