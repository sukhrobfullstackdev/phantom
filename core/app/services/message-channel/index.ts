import { handle as rpcHandle, post as rpcPost } from './json-rpc-channel';
import { handle as themePreviewHandle, postReady as themePreviewPost } from './theme-preview-channel';

export const MessageChannelService = {
  // The `rpc` channel is read/write.
  rpc: {
    handle: rpcHandle,
    post: rpcPost,
  },

  // The `themePreview` channel is read-only.
  themePreview: {
    handle: themePreviewHandle,
    postReady: themePreviewPost,
  },
};
