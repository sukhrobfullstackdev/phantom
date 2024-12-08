import React, { useEffect, useRef, useState } from 'react';
import { useEventOrigin, useUIThreadPayload, useUIThreadRenderFn } from '../../../hooks/ui-thread-hooks';
import { OldPendingModalPage } from './pre-feature-framework-pending-modal-view';
import { UnauthorizedDomainError } from '~/app/ui/components/partials/pending-modal/generic-errors/unauthorized-domain-error/unauthorized-domain-error';
import { Modal } from '~/app/ui/components/layout/modal';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { store } from '~/app/store';
import { assertURLWithDomainAllowlist } from '~/app/libs/url-assert';
import { ControlFlowErrorCode, createControlFlowError } from '~/app/libs/exceptions';
import { isMobileSDK } from '~/app/libs/platform';
import { IS_DEPLOY_ENV_LOCAL, IS_DEPLOY_ENV_STAGEF } from '~/shared/constants/env';
import { isValidIPAddress } from '~/shared/libs/validators';

/**
 * This hook returns the React render function saved into global state for the
 * JSON RPC payload currently being processed. As opposed to rendering pages for
 * the core flows (like above), this will render whatever views are attached to
 * the current RPC route.
 */
function useFeatureRender() {
  const payload = useUIThreadPayload();
  const FeatureRender = useUIThreadRenderFn();
  const PrevFeatureRender = useRef<typeof FeatureRender>();

  useEffect(() => {
    if (FeatureRender) {
      // Only save the most recently defined `FeatureRender` value.
      PrevFeatureRender.current = FeatureRender;
    }
  }, [FeatureRender]);

  // `payload.method` will be undefined if the most recent UI thread payload
  // finishes processing. To avoid losing context with the currently rendered
  // view, we persist the most recently-used React component.
  return payload?.method === undefined ? PrevFeatureRender.current : FeatureRender;
}

export const PendingModal: React.FC = () => {
  const FeatureRender = useFeatureRender();
  const payload = useUIThreadPayload();

  const [isAuthorizedDomain, setIsAuthorizedDomain] = useState<boolean>();
  const eventOrigin = useEventOrigin();

  // hacky way to check allowlist ahead of all middlewares and RPC payloads
  // Todo optimize this logic in global preprocessor
  useEffect(() => {
    const passCheck = checkAllowlist(eventOrigin, payload);
    setIsAuthorizedDomain(passCheck);
    if (!passCheck) {
      createControlFlowError(ControlFlowErrorCode.RequestNotAuthorizedForDomainInRelayer).setUIThreadError();
    }
  }, [eventOrigin, payload]);

  if (isAuthorizedDomain !== undefined && !isAuthorizedDomain) {
    return (
      <Modal.RPC>
        <div id="modal-portal">
          <UnauthorizedDomainError />
        </div>
      </Modal.RPC>
    );
  }

  return FeatureRender ? <FeatureRender /> : <OldPendingModalPage />;
};

// Checks Allowlist before processing any payload or rendering routes
const checkAllowlist = (eventOrigin: string, payload?: JsonRpcRequestPayload) => {
  const { accessAllowlists } = store.getState().System;
  const isAllowlistCheckEnabled = accessAllowlists?.domain.length;

  const isPayloadMethodMagic =
    payload?.method.includes('mc') || payload?.method.includes('magic') || payload?.method.includes('mwui');

  // Check if the eventOrigin is an IP address using the isValidIPAddress function
  const isIPAddress = isValidIPAddress(eventOrigin);

  return (
    !isAllowlistCheckEnabled ||
    !isPayloadMethodMagic ||
    (isIPAddress && (IS_DEPLOY_ENV_LOCAL || IS_DEPLOY_ENV_STAGEF) && isMobileSDK()) || // Return true if within a local / stagef mobile development environment
    assertURLWithDomainAllowlist(accessAllowlists.domain, eventOrigin)
  );
};
