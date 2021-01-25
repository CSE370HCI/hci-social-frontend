import { Hook, HookDecorator, MergeHooks, ValidateQueryParam } from '@foal/core';

export function ValidateQuery(schema: Record<string, any>): HookDecorator {
  return MergeHooks(
    ...Object.keys(schema.properties).map(
      name => ValidateQueryParam(name, schema.properties[name], { required: schema.required.includes(name) })
    )
  );
}
