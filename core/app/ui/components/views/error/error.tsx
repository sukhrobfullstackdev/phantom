import React, { useState, useEffect } from 'react';
import qs from 'qs';
import { Icon, Spacer, Flex } from '@magiclabs/ui';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { getOptionsFromEndpoint } from '~/app/libs/query-params';
import { Endpoint } from '~/server/routes/endpoint';
import { i18n } from '~/app/libs/i18n';
import { StandardPage } from '../../layout/standard-page';

import styles from './error.less';
import { Modal } from '../../layout/modal';
import { TrafficCone } from '~/shared/svg/auth';

export const Error: React.FC = () => {
  const { theme, isDefaultTheme } = useTheme();

  const [errorOptions, setErrorOptions] = useState(getOptionsFromEndpoint(Endpoint.Client.ErrorV1));

  const label = isDefaultTheme('appName') ? (
    <>{i18n.generic.please_contact_app_devs_generic.toMarkdown()}</>
  ) : (
    <>{i18n.generic.please_contact_app_devs_app.toMarkdown({ appName: theme.appName })}</>
  );

  /*
   * getOptionsFromEndpoint doesn't output the target url due to the <Redirect> from React-router
   * used in Oauth flow.
   * Use the original query parsing to get the query from the url after rendering
   */
  useEffect(() => {
    const searchParams = window.location.search;
    if (searchParams) {
      setErrorOptions(qs.parse(searchParams.substr(1)));
    }
  }, []);

  /* Use error_description as second fallback for Oauth errors */
  const message =
    errorOptions.message || errorOptions.error_description || i18n.generic.an_unknown_error_occured.toString();

  return (
    <StandardPage>
      <Modal in>
        <Flex.Column horizontal="center">
          <Icon type={TrafficCone} />
          <Spacer size={28} orientation="vertical" />
          <h1 className="fontCentered">{i18n.generic.uh_oh_something_went_wrong.toMarkdown()}</h1>
          <Spacer size={8} orientation="vertical" />
          <div className="fontDescriptionSmall fontCentered">{label}</div>
          <Spacer size={24} orientation="vertical" />
          <div className={styles.details}>
            <b>{i18n.generic.details.toString()}</b>
          </div>
          <div className={styles.details}>{message}</div>
        </Flex.Column>
      </Modal>
    </StandardPage>
  );
};
