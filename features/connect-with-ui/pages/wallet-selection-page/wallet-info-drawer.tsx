import React, { useEffect, useState } from 'react';
import { Flex, Spacer, Typography } from '@magiclabs/ui';
import { motion } from 'framer-motion';
import { Button, ButtonSize, ButtonVariant } from '../../components/button';
import { DrawerOverlay } from '../../components/drawer-overlay';
import { AngleDown, CloseIcon } from '~/shared/svg/magic-connect';
import { walletFAQs } from './wallet-faqs';
import styles from './wallet-selection-page.less';

const WalletFaqItem = ({ question, answer }) => {
  const [isQuestionOpen, setIsQuestionOpen] = useState(false);

  const toggleQuestionOpen = () => {
    setIsQuestionOpen(!isQuestionOpen);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        className={styles.questionButton}
        onClick={toggleQuestionOpen}
        onKeyPress={toggleQuestionOpen}
      >
        <Flex.Row alignItems="center">
          <motion.div animate={{ rotate: isQuestionOpen ? -180 : 0 }} className={styles.angleDownButton}>
            <Button onClick={() => null} size={ButtonSize.xSmall} variant={ButtonVariant.subtle} iconType={AngleDown} />
          </motion.div>
          <Spacer size={8} orientation="horizontal" />
          <Typography.BodyMedium weight="500">{question}</Typography.BodyMedium>
        </Flex.Row>
      </div>
      <Spacer size={10} orientation="vertical" />
      <motion.div
        style={{ marginLeft: '40px' }}
        animate={{
          height: isQuestionOpen ? '100%' : '0px',
        }}
        aria-expanded={isQuestionOpen}
      >
        <Typography.BodySmall weight="400" tagOverride="span" className={styles.text}>
          {isQuestionOpen && answer}
        </Typography.BodySmall>
        <Spacer size={15} orientation="vertical" />
      </motion.div>
    </div>
  );
};

export const WalletInfoDrawer = ({ isDrawerOpen, setIsDrawerOpen, handleToggleDrawer }) => {
  const [drawerHeight, setDrawerHeight] = useState<any>(0);

  useEffect(() => {
    window.addEventListener('resize', setHeightAccordingToModalSize);
    setTimeout(() => {
      setHeightAccordingToModalSize();
    }, 500);
    return () => {
      window.removeEventListener('resize', setHeightAccordingToModalSize);
    };
  }, []);

  const setHeightAccordingToModalSize = () => {
    const height = document.getElementById('magic-modal')?.offsetHeight;
    if (height) {
      setDrawerHeight(height - 150);
    }
  };

  return (
    <DrawerOverlay openFrom="bottom" isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen}>
      <div className={styles.drawerContainer} style={{ height: `${drawerHeight}px` }}>
        <div>
          <Flex.Row alignItems="center" justifyContent="space-between">
            <div style={{ height: '36px', width: '36px' }} />
            <Typography.BodySmall weight="400" className={styles.text}>
              Wallet FAQs
            </Typography.BodySmall>
            <Button
              onClick={handleToggleDrawer}
              size={ButtonSize.small}
              variant={ButtonVariant.subtle}
              iconType={CloseIcon}
            />
          </Flex.Row>
          <div className={styles.questionAnswerContainer}>
            {walletFAQs.map(questionAnswerObj => {
              return (
                <div key={questionAnswerObj.question}>
                  <Spacer size={15} orientation="vertical" />
                  <WalletFaqItem question={questionAnswerObj.question} answer={questionAnswerObj.answer} />
                  <Spacer size={5} orientation="vertical" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DrawerOverlay>
  );
};
