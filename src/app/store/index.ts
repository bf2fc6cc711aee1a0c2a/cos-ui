import notificationsMiddleware from '@redhat-cloud-services/frontend-components-notifications/notificationsMiddleware';
import ReducerRegistry from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import promiseMiddleware from 'redux-promise-middleware';

let registry: ReducerRegistry<any> | undefined = undefined;

export function init(...middleware: any) {
  if (!registry) {
    registry = getRegistry({}, [
      promiseMiddleware,
      notificationsMiddleware,
      ...middleware,
    ]);
    console.log('Using reducer registry: ', registry);
  }
  return registry;
}
