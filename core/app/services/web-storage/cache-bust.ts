import { data } from './data-api';
import { CLIENT_STORAGE_VERSION } from './model';

/**
 * Cache-bust `WebStorage` and `IndexedDB` if the
 * recognized `CLIENT_STORAGE_VERSION` has changed.
 */
export async function cacheBust() {
  const version = await data.getItem('__client_storage_version__');

  if (version) {
    if (version !== CLIENT_STORAGE_VERSION) {
      await data.clear();
    }
  } else {
    await data.setItem('__client_storage_version__', CLIENT_STORAGE_VERSION);
  }
}
