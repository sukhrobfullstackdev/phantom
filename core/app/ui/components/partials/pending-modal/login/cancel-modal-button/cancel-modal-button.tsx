import { Icon } from '@magiclabs/ui';
import React from 'react';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { i18n } from '~/app/libs/i18n';
import { useCloseUIThread } from '~/app/ui/hooks/ui-thread-hooks';
import { useTheme } from '~/app/ui/hooks/use-theme';
import styles from './cancel-modal-button.less';
import { CloseIcon } from '~/shared/svg/magic-connect';

export const CancelModalButton = () => {
  const cancel = useCloseUIThread(sdkErrorFactories.magic.userCancelLogin());
  const theme = useTheme();

  return (
    <button className={styles.CancelModalButton} onClick={cancel} aria-label={i18n.generic.close.toString()}>
      <Icon type={CloseIcon} size={12} color={theme.theme.isDarkTheme ? 'white' : '#4E4D52'} />
    </button>
  );
};
