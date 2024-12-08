import { createServiceError } from '~/app/libs/exceptions';
import { mockApiReject } from '~/app/libs/api-response-helper';

const error_code = 'ANOMALOUS_REQUEST_DETECTED';
const message = 'something';

test('Returns error_code and message', async () => {
  const actual = await mockApiReject(error_code, message).catch(reason => reason);
  const expected = createServiceError({ error_code, message });
  expect(actual).toEqual(expected);
});
