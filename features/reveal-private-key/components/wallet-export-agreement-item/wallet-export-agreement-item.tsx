import React from 'react';
import { Checkbox, Flex, Typography } from '@magiclabs/ui';
import styles from './wallet-export-agreement-item.less';

type ContentItem = string | React.ReactNode;
type Content = ContentItem | ContentItem[];

interface AgreementItemProps {
  content: Content;
  isChecked: boolean;
  setIsChecked: (isChecked: boolean) => void;
}

export const WalletExportAgreementItem: React.FC<AgreementItemProps> = ({ content, isChecked, setIsChecked }) => {
  const processContent = inputContent => {
    const contentArray = typeof inputContent === 'string' ? [inputContent] : inputContent;

    let lastStringIndex = contentArray.length - 1;
    while (typeof contentArray[lastStringIndex] !== 'string' && lastStringIndex >= 0) {
      lastStringIndex--;
    }

    if (lastStringIndex >= 0) {
      const parts = contentArray[lastStringIndex].split(' ');
      if (parts.length > 2) {
        parts[parts.length - 2] = `${parts[parts.length - 2]}\u00A0${parts.pop()}`;
        contentArray[lastStringIndex] = parts.join(' ');
      }
    }

    return contentArray;
  };

  const processedContent = processContent(content);

  return (
    <Flex.Row className={styles.agreementItem} alignItems="flex-start">
      <div className={styles.checkboxContainer} style={{ opacity: isChecked ? 1 : '' }}>
        <Checkbox className={styles.checkbox} onChange={() => setIsChecked(!isChecked)} checked={isChecked} />
      </div>
      <Typography.BodySmall weight="400">
        {processedContent.map((item, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={`${item}-${index}`}>{item}</React.Fragment>
        ))}
      </Typography.BodySmall>
    </Flex.Row>
  );
};
