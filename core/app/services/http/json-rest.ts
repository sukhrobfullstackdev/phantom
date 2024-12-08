import { createRestUtilities } from '~/shared/libs/axios/client-side-axios';
import { createServiceError } from '~/app/libs/exceptions';

export const genericJsonRestUtilities = createRestUtilities({
  metadataFactory: config => ({ body: config.data }),
  errorTransform: (err, metadata) => createServiceError(err.response?.data ?? err, { urgency: 'warning', ...metadata }),
});
