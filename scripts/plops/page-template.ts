import React from 'react';
import { createFeatureModule } from '~/features/framework';

export default createFeatureModule.Page({
  render: () => {
    return <div>/asdf</div>;
  },

  parseApiKey: () => 'hello',
  parseLocale: () => 'pl_pl',
  parseTheme: () => ({
    button_color: null,
    theme_color: 'light',
    asset_uri: null,
    app_name: null,
  }),
});
