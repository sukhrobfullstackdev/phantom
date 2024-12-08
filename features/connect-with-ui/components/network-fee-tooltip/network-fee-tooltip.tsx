import React from 'react';
import { HoverActivatedTooltip, Icon, MonochromeIcons, Typography } from '@magiclabs/ui';

export const NetworkFeeTooltip = () => {
  return (
    <HoverActivatedTooltip placement="bottom" style={{ display: 'inline-flex' }}>
      <HoverActivatedTooltip.Anchor>
        <Icon size={14} type={MonochromeIcons.QuestionFilled} color="#B6B4BA" />
      </HoverActivatedTooltip.Anchor>
      <HoverActivatedTooltip.Content style={{ width: '180px' }}>
        <Typography.BodySmall weight="400">
          This processing fee applies to all blockchain transactions. Prices vary based on network traffic.
        </Typography.BodySmall>
      </HoverActivatedTooltip.Content>
    </HoverActivatedTooltip>
  );
};
