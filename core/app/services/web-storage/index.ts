import { cacheBust } from './cache-bust';
import { data, WebStorageDataAPI } from './data-api';
import { WebStorageModel } from './model';

export const WebStorageService = {
  data,
  cacheBust,
};

export { WebStorageDataAPI, WebStorageModel };
