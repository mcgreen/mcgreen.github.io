import { Resource } from '@angular/core';

/**
 * Reads a resource without ever throwing. `resource.value()` THROWS while the resource is in
 * the error state (Angular skill rule), so every read goes through `hasValue()`. Returns
 * `undefined` while loading, idle or failed; use `error()` / `isLoading()` for those cases.
 */
export function safe<T>(res: Resource<T | undefined>): T | undefined {
  return res.hasValue() ? res.value() : undefined;
}
