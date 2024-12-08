import sinon from 'sinon';
import { MessageChannelService } from '~/app/services/message-channel';

import {
  startJsonRpcMessageChannel,
  stopJsonRpcMessageChannel,
  startThemePreviewMessageChannel,
  stopThemePreviewMessageChannel,
  overlayGreenlight,
  showOverlay,
  hideOverlay,
  setShowUI,
  setSystemClockOffset,
} from '~/app/store/system/system.actions';

test('startJsonRpcMessageChannel', () => {
  const action = startJsonRpcMessageChannel();
  expect(action).toEqual({ type: 'system/START_JSON_RPC_MESSAGE_CHANNEL' } as any);
});

test('stopJsonRpcMessageChannel', () => {
  const action = stopJsonRpcMessageChannel();
  expect(action).toEqual({ type: 'system/STOP_JSON_RPC_MESSAGE_CHANNEL' } as any);
});

test('startThemePreviewMessageChannel', () => {
  const stub = sinon.stub(MessageChannelService.themePreview, 'postReady');
  const action = startThemePreviewMessageChannel();
  // @ts-expect-error
  expect(stub.args[0]).toEqual([] as null);
  expect(action).toEqual({ type: 'system/START_THEME_PREVIEW_MESSAGE_CHANNEL' } as any);
  stub.restore();
});

test('stopThemePreviewMessageChannel', () => {
  const action = stopThemePreviewMessageChannel();
  expect(action).toEqual({ type: 'system/STOP_THEME_PREVIEW_MESSAGE_CHANNEL' } as any);
});

test('overlayGreenlight', () => {
  const stub = sinon.stub(MessageChannelService.rpc, 'post');
  const action = overlayGreenlight();
  expect(stub.args[0]).toEqual(['MAGIC_OVERLAY_READY'] as any);
  expect(action).toEqual({ type: 'system/FORTMATIC_OVERLAY_GREENLIGHT' } as any);
  stub.restore();
});

test('showOverlay', () => {
  const stub = sinon.stub(MessageChannelService.rpc, 'post');
  const action = showOverlay();
  expect(stub.args[0]).toEqual(['MAGIC_SHOW_OVERLAY'] as any);
  expect(action).toEqual({ type: 'system/FORTMATIC_SHOW_OVERLAY' } as any);
  stub.restore();
});

test('hideOverlay', () => {
  const stub = sinon.stub(MessageChannelService.rpc, 'post');
  const action = hideOverlay();
  expect(stub.args[0]).toEqual(['MAGIC_HIDE_OVERLAY'] as any);
  expect(action).toEqual({ type: 'system/FORTMATIC_HIDE_OVERLAY' } as any);
  stub.restore();
});

test('setShowUI', () => {
  const action = setShowUI(true);
  expect(action).toEqual({ type: 'system/SET_SHOW_UI', payload: true });
});

test('setSystemClockOffset', () => {
  const action = setSystemClockOffset(0);
  expect(action).toEqual({ type: 'system/SET_SYSTEM_CLOCK_OFFSET', payload: 0 - Date.now() });
});
