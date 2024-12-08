import { getLoggerType } from '~/app/libs/datadog-error-classification';
import { AuthRelayerErrorCode } from '~/server/libs/exceptions/auth-relayer-server-error-codes';
import {
  ControlFlowErrorCode,
  ContolFlowMappedErrorCode,
} from '~/app/libs/exceptions/error-types/error-codes/control-flow-error-codes';
import { MagicApiErrorCode } from '~/app/libs/exceptions/error-types/error-codes/magic-api-error-code';

describe('errorClassification', () => {
  it('returns correct logger type for known error', () => {
    const result = getLoggerType(ControlFlowErrorCode.UnknownError);
    expect(result).toEqual({ loggerType: 'error', codeFoundInErrorMap: true });
  });

  it('returns correct logger type for known warn', () => {
    const result = getLoggerType(ContolFlowMappedErrorCode.AUTH_PASSWORDLESS_LOGIN_EMAIL_SENT);
    expect(result).toEqual({ loggerType: 'warn', codeFoundInErrorMap: true });
  });

  it('returns correct logger type for known info', () => {
    const result = getLoggerType(ControlFlowErrorCode.DeviceVerificationLinkExpired);
    expect(result).toEqual({ loggerType: 'info', codeFoundInErrorMap: true });
  });

  it('returns correct logger type for a specific RPC error code (number)', () => {
    const result = getLoggerType(-32600);
    expect(result).toEqual({ loggerType: 'error', codeFoundInErrorMap: true });
  });

  it('returns correct logger type for a specific RPC error code (string)', () => {
    const result = getLoggerType('-32600');
    expect(result).toEqual({ loggerType: 'error', codeFoundInErrorMap: true });
  });

  it('returns correct logger type for a Auth Relayer Server error code', () => {
    const result = getLoggerType(AuthRelayerErrorCode.MissingRequiredHeaders);
    expect(result).toEqual({ loggerType: 'warn', codeFoundInErrorMap: true });
  });

  it('returns correct logger type for a specific Fortmatic error code', () => {
    const result = getLoggerType(MagicApiErrorCode.INTERNAL_SERVER_ERROR);
    expect(result).toEqual({ loggerType: 'error', codeFoundInErrorMap: true });
  });

  it('returns correct logger type for ECONNABORTED', () => {
    const result = getLoggerType('ECONNABORTED');
    expect(result).toEqual({ loggerType: 'error', codeFoundInErrorMap: true });
  });

  it('returns correct logger type for an error not in error map', () => {
    const result = getLoggerType('error not in map');
    expect(result).toEqual({ loggerType: 'warn', codeFoundInErrorMap: false });
  });

  it('returns correct logger type for an RPC code not in error map', () => {
    const result = getLoggerType(-12345);
    expect(result).toEqual({ loggerType: 'warn', codeFoundInErrorMap: false });
  });
});
