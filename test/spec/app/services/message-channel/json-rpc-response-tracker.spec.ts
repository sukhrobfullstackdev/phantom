import { JsonRpcResponseTracker, MessageEventData } from '~/app/services/message-channel/json-rpc-response-tracker';
import { getLogger } from '~/app/libs/datadog';
import { JsonRpcError, MagicIncomingWindowMessage } from 'magic-sdk';

jest.mock('~/app/libs/datadog', () => ({
  getLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }),
}));

type MockPerformance = {
  now: jest.Mock<number>;
};

Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(),
  } as MockPerformance,
});

describe('JsonRpcResponseTracker', () => {
  const originalWindowHandle = global.window.magic;

  beforeEach(() => {
    global.window.magic = {};
    jest.spyOn(performance, 'now').mockReturnValue(1234567890);

    const logger = getLogger();

    jest.spyOn(logger, 'info').mockImplementation();
    jest.spyOn(logger, 'error').mockImplementation();
    jest.spyOn(logger, 'warn').mockImplementation();

    jest.clearAllMocks();
  });

  afterAll(() => {
    global.window.magic = originalWindowHandle;
  });

  it('should add tracking data to window', () => {
    const testEventData = {
      msgType: 'testMsgType',
      payload: { id: '123', method: 'mc_login' },
    } as Partial<MessageEventData>;

    JsonRpcResponseTracker.addTrackingDataToWindow(testEventData);

    expect(window.magic?.['123']).toBeDefined();
    expect(window.magic?.['123'].method).toBe('mc_login');
  });

  it('should log success correctly', () => {
    // @ts-ignore
    performance.now.mockImplementation(() => 200);
    if (window?.magic) window.magic['123'] = { timeReceived: 100, method: 'mc_login' };

    const response = { id: '123', error: undefined, jsonrpc: '2.0' };
    const jsonRpcError = undefined;

    JsonRpcResponseTracker.logCompletion(response, 'MAGIC_HANDLE_RESPONSE' as MagicIncomingWindowMessage);

    expect(getLogger().info).toHaveBeenCalledWith('Method: mc_login / user spent 100ms in flow / Success', {
      jsonRpcError,
      json_rpc_method: 'mc_login',
      msgType: 'MAGIC_HANDLE_RESPONSE',
      response: { error: undefined, id: '123', jsonrpc: '2.0' },
      rt: undefined,
      timeToCompletion: 100,
    });
  });

  it('should log error correctly', () => {
    // @ts-ignore
    performance.now.mockImplementation(() => 200);
    if (window?.magic) window.magic['123'] = { timeReceived: 100, method: 'mc_login' };

    const response = { id: '123', error: undefined, jsonrpc: '2.0' };

    const jsonRpcError = { message: 'Error', code: -32700, data: '0x0' } as JsonRpcError;

    JsonRpcResponseTracker.logCompletion(
      response,
      'MAGIC_HANDLE_RESPONSE' as MagicIncomingWindowMessage,
      undefined,
      jsonRpcError,
    );

    expect(getLogger().info).toHaveBeenCalledWith(
      'Method: mc_login / user spent 100ms in flow / JSON RPC Error: Error',
      {
        jsonRpcError,
        json_rpc_method: 'mc_login',
        msgType: 'MAGIC_HANDLE_RESPONSE',
        response: { error: undefined, id: '123', jsonrpc: '2.0' },
        rt: undefined,
        timeToCompletion: 100,
      },
    );
  });

  it('should warn when logSuccess is called with an invalid responseId', () => {
    const response = {
      id: undefined as unknown as string,
      error: { message: 'Test', code: 12345 },
      jsonrpc: '2.0',
    };
    JsonRpcResponseTracker.logCompletion(response, 'MAGIC_HANDLE_RESPONSE' as MagicIncomingWindowMessage);

    expect(getLogger().warn).toHaveBeenCalledWith('JsonRpcRepsonse has an invalid responseId:', {
      msgType: 'MAGIC_HANDLE_RESPONSE',
      response: { error: { code: 12345, message: 'Test' }, id: undefined, jsonrpc: '2.0' },
      rt: undefined,
    });
  });

  it('should handle adding tracking data with no payload id', () => {
    const testEventData = {
      msgType: 'testMsgType',
      payload: { method: 'mc_login' }, // No ID provided here
    } as Partial<MessageEventData>;

    JsonRpcResponseTracker.addTrackingDataToWindow(testEventData);

    expect(Object.keys(window?.magic as {})).not.toContain(undefined);
  });

  it('should not log success when there is no corresponding tracking data', () => {
    const responseId = 'non-existent-id';
    const response = {
      id: responseId,
      error: { message: 'Test', code: 12345 },
      jsonrpc: '2.0',
    };
    JsonRpcResponseTracker.logCompletion(response, 'MAGIC_HANDLE_RESPONSE' as MagicIncomingWindowMessage);

    expect(getLogger().info).not.toHaveBeenCalled();
  });

  it('should remove tracking data after logging completion', () => {
    // @ts-ignore
    performance.now.mockImplementation(() => 400);
    if (window?.magic) window.magic['unique-id'] = { timeReceived: 250, method: 'mc_login' };
    const response = {
      id: 'unique-id',
      error: { message: 'Test', code: 12345 },
      jsonrpc: '2.0',
    };
    JsonRpcResponseTracker.logCompletion(response, 'MAGIC_HANDLE_RESPONSE' as MagicIncomingWindowMessage);

    expect(window?.magic?.['unique-id']).toBeUndefined();
  });

  it('should correctly determine SDK interface from method', () => {
    const testMethod = 'mc_login';
    const expectedInterface = 'Login';

    const sdkDetails = JsonRpcResponseTracker.getSdkDetails({ method: testMethod, timeReceived: Date.now() });

    expect(sdkDetails.sdkInterface).toBe(expectedInterface);
    expect(sdkDetails.payloadMethod).toBe(testMethod);
  });

  it('should handle unknown methods by setting SDK interface to "Unknown SDK interface"', () => {
    const unknownMethod = 'unknown_method';
    const sdkDetails = JsonRpcResponseTracker.getSdkDetails({ method: unknownMethod, timeReceived: Date.now() });

    expect(sdkDetails.sdkInterface).toBe('Unknown SDK interface');
    expect(sdkDetails.payloadMethod).toBe(unknownMethod);
  });
});
