import { MonochromeIconDefinition } from '@magiclabs/ui';
import React from 'react';

export const Edit: MonochromeIconDefinition = {
  SVGContents: ({ fill }) => {
    return (
      <>
        <path
          d="M12.0775 2.17058L14.7253 4.82929L7.306 12.2792L4.65968 9.62047L12.0775 2.17058ZM16.7345 1.52936L15.5536 0.343672C15.0973 -0.114557 14.3563 -0.114557 13.8984 0.343672L12.7673 1.47945L15.4151 4.13818L16.7345 2.81336C17.0884 2.45793 17.0884 1.88477 16.7345 1.52936ZM3.99095 12.6376C3.94276 12.8554 4.13856 13.0505 4.35545 12.9975L7.306 12.2792L4.65968 9.62047L3.99095 12.6376Z"
          {...fill}
        />
        <path
          d="M12.0775 2.17058L14.7253 4.82929L13.181 6.38006V4.64706C13.181 4.15975 12.7875 3.76471 12.3022 3.76471H10.4903L12.0775 2.17058Z"
          {...fill}
        />
        <path
          d="M7.67376 3.76471L9.43086 2H2.63619C1.18026 2 0 3.18513 0 4.64706V14.3529C0 15.8149 1.18026 17 2.63619 17H12.3022C13.7582 17 14.9384 15.8149 14.9384 14.3529V7.44378L13.181 9.20849V14.3529C13.181 14.8403 12.7875 15.2353 12.3022 15.2353H2.63619C2.15088 15.2353 1.75746 14.8403 1.75746 14.3529V4.64706C1.75746 4.15975 2.15088 3.76471 2.63619 3.76471H7.67376Z"
          {...fill}
        />
        <path d="M13.6647 2.38046L14.5595 3.27902C14.3382 2.91166 14.0305 2.60266 13.6647 2.38046Z" {...fill} />
      </>
    );
  },

  viewbox: [0, 0, 17, 17],
  color: theme => (theme.color.primary.base.isLight() ? theme.hex.primary.darker : theme.hex.primary.base),
};
