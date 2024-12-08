import React, { useState } from 'react';
import { Linkable, Typography } from '@magiclabs/ui';

interface TruncatedTextProps {
  children: string;
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({ children }) => {
  const [isTextOpen, setIsTextOpen] = useState(false);

  const openDescription = () => {
    setIsTextOpen(true);
  };

  return (
    <Typography.BodySmall style={{ fontWeight: 400 }}>
      {children.length > 140 && !isTextOpen ? <>{children.substring(0, 140)}... </> : <>{children}</>}
      {children.length < 141 ||
        (!isTextOpen && (
          <Linkable>
            <button onClick={openDescription}>
              <b>Read More</b>
            </button>
          </Linkable>
        ))}
    </Typography.BodySmall>
  );
};
