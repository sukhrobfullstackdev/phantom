import React from 'react';
import { Emoji, Icon, Spacer, Flex } from '@magiclabs/ui';
import { i18n } from '~/app/libs/i18n';
import { StandardPage } from '../../layout/standard-page';
import { Modal } from '../../layout/modal';
import { TrafficCone } from '~/shared/svg/auth';

export const NoMatch: React.FC = () => {
  return (
    <StandardPage>
      <Modal in>
        <Flex.Column horizontal="center">
          <Icon type={TrafficCone} />
          <Spacer size={28} orientation="vertical" />

          <h1>{i18n.generic.uh_oh_something_went_wrong.toMarkdown()}</h1>
          <Spacer size={8} orientation="vertical" />

          <p className="fontDescription fontCentered">
            {i18n.generic.couldnt_find_resource.toString()}
            <Spacer inline size={8} />
            <Emoji symbol="😰" />
          </p>
        </Flex.Column>
      </Modal>
    </StandardPage>
  );
};
