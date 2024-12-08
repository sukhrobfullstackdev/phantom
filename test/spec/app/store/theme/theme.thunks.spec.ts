import sinon from 'sinon';
import browserEnv from '@ikscodes/browser-env';
import { mockCoreStore } from '../../../_utils/mockStore';
import { dummyPromise } from '~/test/spec/_utils/dummy-promise';
import { ThemeThunks } from '~/app/store/theme/theme.thunks';

const decodedQueryParams = { hello: 'world' };
const decodeableQueryParams = 'eyJoZWxsbyI6IndvcmxkIn0%3D';

let sandbox: sinon.SinonSandbox;

beforeEach(() => {
  sandbox = sinon.createSandbox();
});

test('#1 bootstrapThemeAndConfig successfully for Endpoint.Client.SendV1', async () => {
  const store = mockCoreStore({});

  browserEnv.stub('window.location', { pathname: '/send' });

  const stub0 = sandbox.stub(ThemeThunks, 'hydrateAppConfigFromApi');
  stub0.returns(dummyPromise);

  await store.dispatch(ThemeThunks.bootstrapThemeAndConfig());

  expect(stub0.calledWith()).toBe(true);
});

test('#2 bootstrapThemeAndConfig successfully for Endpoint.Client.SendLegacy', async () => {
  const store = mockCoreStore({});

  browserEnv.stub('window.location', { pathname: '/send-legacy' });

  const stub0 = sandbox.stub(ThemeThunks, 'hydrateAppConfigFromApi');
  stub0.returns(dummyPromise);

  await store.dispatch(ThemeThunks.bootstrapThemeAndConfig());

  expect(stub0.calledWith()).toBe(true);
});

test('#3 bootstrapThemeAndConfig successfully for Endpoint.Client.ConfirmV1', async () => {
  const store = mockCoreStore({});

  browserEnv.stub('window.location', {
    pathname: '/confirm',
    search: `?ct=${decodeableQueryParams}`,
  });

  const stub0 = sandbox.stub(ThemeThunks, 'hydrateAppConfigFromApi');
  stub0.returns(dummyPromise);

  await store.dispatch(ThemeThunks.bootstrapThemeAndConfig());

  expect(stub0.calledWith()).toBe(true);
});

test('#4 bootstrapThemeAndConfig successfully for Endpoint.Client.ConfirmEmailV1', async () => {
  const store = mockCoreStore({});

  browserEnv.stub('window.location', {
    pathname: '/confirm-email/foo',
    search: `?ct=${decodeableQueryParams}`,
  });

  const stub0 = sandbox.stub(ThemeThunks, 'hydrateThemeFromRawConfig');
  stub0.returns(dummyPromise);

  await store.dispatch(ThemeThunks.bootstrapThemeAndConfig());

  expect(stub0.calledWith(decodedQueryParams as any)).toBe(true);
});

test('#5 bootstrapThemeAndConfig successfully for Endpoint.Client.PreviewV1', async () => {
  const store = mockCoreStore({});

  browserEnv.stub('window.location', { pathname: '/preview/type' });

  const stub0 = sandbox.stub(ThemeThunks, 'hydrateThemeFromPreviewQuery');
  stub0.returns(dummyPromise);

  await store.dispatch(ThemeThunks.bootstrapThemeAndConfig());

  expect(stub0.calledWith()).toBe(true);
});

afterEach(() => {
  sandbox.restore();
});
