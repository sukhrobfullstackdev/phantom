import { get } from '~/app/libs/lodash-utils';
import { createFeatureModule } from '~/features/framework';
import { resolvePayload } from '~/app/rpc/utils';
import { marshallLoginParams } from '~/app/rpc/controllers/magic-link-login.controller';
import { testModeStore } from '~/features/test-mode/store';
import { createTestDIDToken } from '~/features/test-mode/utils/test-did-token';
import { ControlFlowErrorCode, createControlFlowError, sdkErrorFactories } from '~/app/libs/exceptions';
import { DefaultTestModePrivateAddress, DefaultTestModePublicAddress } from '~/features/test-mode/constants/auth';
import {
  TEST_FAILED_EMAIL,
  TEST_FAILED_GENERIC_EMAIL,
  TEST_SUCCESS_CUSTOM_KEYS_EMAIL,
  TEST_SUCCESS_EMAIL,
} from '~/features/test-mode/constants/testEmail';
import { setTestModeUserKeys, setTestModeUserEmail, setTestModeLoginStatus } from '../store/test-mode.actions';

const magicLoginWithMagicLinkTestMiddleware = async ({ payload, defaultTokenLifespan, emailNormalized }) => {
  const customKeys = getCustomKeysFromTestEmail(emailNormalized);

  if (emailNormalized === TEST_SUCCESS_EMAIL || !!customKeys) {
    initTestModeState(emailNormalized, customKeys);

    const { publicAddress, privateAddress } = testModeStore.getState();

    const token = await createTestDIDToken({
      userKeys: { publicAddress, privateAddress },
      lifespan: defaultTokenLifespan,
    });

    await resolvePayload(payload, token);
  } else {
    const failReason = validateTestEmailAndGetFailReason(emailNormalized);
    throw sdkErrorFactories.client.testModeEmailFailureAssertion(failReason, emailNormalized);
  }
};

function initTestModeState(email: string, customKeys: { publicAddress?: string; privateAddress?: string } = {}) {
  testModeStore.dispatch(setTestModeUserEmail(email));
  testModeStore.dispatch(
    setTestModeUserKeys({
      publicAddress: DefaultTestModePublicAddress,
      privateAddress: DefaultTestModePrivateAddress,
      ...customKeys,
    }),
  );
  testModeStore.dispatch(setTestModeLoginStatus(true));
}

function getCustomKeysFromTestEmail(emailNormalized: string) {
  const regexp = /\{([^{]+)}/g;

  let publicAddress: string;
  let privateAddress: string;

  if (
    emailNormalized !== TEST_SUCCESS_CUSTOM_KEYS_EMAIL &&
    emailNormalized.replace(regexp, '') === TEST_SUCCESS_CUSTOM_KEYS_EMAIL
  ) {
    [publicAddress, privateAddress] = get(emailNormalized.match(regexp), '[0]')?.slice(1, -1).split(':');
    return { publicAddress, privateAddress };
  }
}

function validateTestEmailAndGetFailReason(emailNormalized: string) {
  const regexp = /\{([^{]+)}/g;

  if (emailNormalized === TEST_FAILED_GENERIC_EMAIL) {
    throw sdkErrorFactories.client.testModeEmailFailureAssertion(-32603, TEST_FAILED_GENERIC_EMAIL);
  }

  let reason = NaN;

  if (emailNormalized !== TEST_FAILED_EMAIL && emailNormalized.replace(regexp, '') === TEST_FAILED_EMAIL) {
    reason = Number(get(emailNormalized.match(regexp), '[0]')?.slice(1, -1));
  }

  if (Number.isNaN(reason)) {
    throw createControlFlowError(ControlFlowErrorCode.InvalidTestModeEmail);
  }

  return reason;
}

export default createFeatureModule.RPC({
  middlewares: [marshallLoginParams, magicLoginWithMagicLinkTestMiddleware],
});
