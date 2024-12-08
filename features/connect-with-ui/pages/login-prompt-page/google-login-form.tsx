import { Skeleton } from '@magiclabs/ui';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { MC_GOOGLE_OAUTH_CLIENT_ID } from '~/shared/constants/env';
import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import styles from './login-prompt-page.less';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { isChromeiOSMobile, isFirefoxAgent, isSafariAgent } from '../../utils/get-user-agent';

export type GoogleLoginFormProps = {
  onGoogleSuccess: (token: string) => void;
};

export const GoogleLoginForm = ({ onGoogleSuccess }: GoogleLoginFormProps) => {
  /**
   * Hide one-tap on safari (web + mobile), firefox (web + mobile), Chrome on iOS (ITP browsers)
   * Show one-tap for chrome (web + android), all other browsers
   */
  const isOneTapSupported = !(isSafariAgent() || isFirefoxAgent || isChromeiOSMobile);
  const { theme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOneTap, setIsOneTap] = useState(isOneTapSupported);
  const [oneTapContainerHeight, setOneTapContainerHeight] = useState(isOneTapSupported ? '184px' : '0');
  const googleButtonDefaultWidth = 336;
  const [googleButtonWidth, setGoogleButtonWidth] = useState(googleButtonDefaultWidth);

  const variants = {
    hidden: { opacity: 0, y: '15%' },
    visible: { opacity: 1, y: 0 },
  };

  const renderOneTap = goog => {
    goog.accounts.id.prompt(event => {
      if (event.isNotDisplayed() || event.isSkippedMoment() || event.isDismissedMoment()) {
        setIsOneTap(false);
        renderGoogleButton(goog);
      }
    });
  };

  const renderGoogleButton = goog => {
    goog.accounts.id.renderButton(document.getElementById('googleButton'), {
      theme: theme.isLightTheme ? 'outline' : 'filled_black',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      width: googleButtonWidth,
    });
  };

  useEffect(() => {
    const modalBreakpoint = 480;
    const modalPadding = 65;
    const resizeWindow = new ResizeObserver(() => {
      if (window.innerWidth >= modalBreakpoint) {
        setGoogleButtonWidth(googleButtonDefaultWidth);
      } else {
        setGoogleButtonWidth(window.innerWidth - modalPadding);
      }
    });
    resizeWindow.observe(document.body);
    return () => {
      resizeWindow.disconnect();
    };
  }, []);

  useEffect(() => {
    // We need to wait for the script tag lib to load.
    // Google doesn't have an package for their lib
    // only script tags.
    const handle = setInterval(() => {
      const goog = (window as any).google;

      // not yet loaded.
      if (!goog) return;
      goog.accounts.id.initialize({
        client_id: MC_GOOGLE_OAUTH_CLIENT_ID,
        prompt_parent_id: 'oneTapContainer',
        itp_support: isOneTapSupported,
        auto_select: false,
        close_on_tap_outside: false,
        context: 'use',
        callback: result => {
          trackAction(AnalyticsActionType.LoginStarted, eventData);
          onGoogleSuccess(result.credential);
        },
      });

      if (isOneTapSupported) {
        renderOneTap(goog);
      } else {
        renderGoogleButton(goog);
      }

      window.clearInterval(handle);
    }, 100);

    return () => window.clearInterval(handle);
  }, [googleButtonWidth]);

  useEffect(() => {
    // This is a hacky solution to prevent visual jank with the iframe one tap container
    // Issue is that on the first render the dom "correct" calculated height is way too tall.
    // This causes a visual flash before it gets the right heigh via resize observer. Eww.
    // if we skip applying the first render, the jank goes away.
    let obsCount = 0;
    const resizeObs = new ResizeObserver(entries => {
      obsCount++;
      const oneTapContainerExpandedViewHeight = 770;
      if (entries[0].contentRect.height >= oneTapContainerExpandedViewHeight) {
        setOneTapContainerHeight('323px');
      }
      if (entries.length > 0 && obsCount > 1) {
        obsCount--;
        setOneTapContainerHeight(`${entries[0].contentRect.height}px`);
      }
    });
    const obs = new MutationObserver(() => {
      setTimeout(() => setIsLoaded(true), 1000);
      const credPickerContainer = document.querySelector('#credential_picker_container iframe');
      if (credPickerContainer) {
        resizeObs.observe(credPickerContainer);
      }
    });

    obs.observe(document.getElementById('googleButton') as any, {
      childList: true,
    });
    obs.observe(document.getElementById('oneTapContainer') as any, {
      childList: true,
    });

    return () => {
      resizeObs.disconnect();
      obs.disconnect();
    };
  }, []);

  return (
    <div className={styles.GoogleLoginForm}>
      <motion.div
        animate={isLoaded ? 'visible' : 'hidden'}
        variants={variants}
        transition={{
          duration: 0.45,
        }}
      >
        <div
          className={styles.oneTapContainer}
          id="oneTapContainer"
          style={{
            display: isLoaded ? 'block' : 'none',
            height: isOneTap ? oneTapContainerHeight : '0',
          }}
        />
        <div
          id="googleButton"
          style={{
            display: isLoaded ? 'block' : 'none',
            height: isOneTap ? '0' : '44px',
          }}
        />
      </motion.div>
      {!isLoaded && (
        <div
          style={{
            padding: '8px',
            borderRadius: '18px',
            background: '#0004',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Skeleton shape="circle" height="32px" width="32px" />
          <Skeleton shape="pill" height="20px" />
        </div>
      )}
    </div>
  );
};
