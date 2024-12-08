import React, {
  PropsWithChildren,
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import styles from './popover.less';
import { clsx } from '@magiclabs/ui';

import { useThemeMode } from '../../hooks/useThemeMode';

type Props = {
  children: ReactElement;
};

type PopoverContextType = {
  opened: boolean;
  setOpened: (value: boolean) => void;
};

const PopoverContext = createContext<PopoverContextType>({
  opened: false,
  setOpened: () => {},
});

export const Popover = ({ children }: PropsWithChildren) => {
  const [opened, setOpened] = useState(false);
  const [entered, setEntered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setEntered(true);
  }, []);

  const hanldeMouseLeave = useCallback(() => {
    setEntered(false);
  }, []);

  useEffect(() => {
    const closePopover = () => {
      if (!entered) {
        setOpened(false);
      }
    };

    window.addEventListener('click', closePopover);

    return () => {
      window.removeEventListener('click', closePopover);
    };
  }, [entered]);

  return (
    <PopoverContext.Provider
      value={{
        opened,
        setOpened,
      }}
    >
      <div className={clsx(styles.popover)} onMouseEnter={handleMouseEnter} onMouseLeave={hanldeMouseLeave}>
        <>{children}</>
      </div>
    </PopoverContext.Provider>
  );
};

export const PopoverTrigger = ({ children }: Props) => {
  const { opened, setOpened } = useContext(PopoverContext);

  return (
    <div
      role="presentation"
      className={clsx(styles['popover-triger'])}
      onClick={() => {
        setOpened(!opened);
      }}
    >
      {children}
    </div>
  );
};

export const PopoverContent = ({ children }: PropsWithChildren) => {
  const { isDark } = useThemeMode();
  const { opened } = useContext(PopoverContext);

  return (
    <div className={clsx(styles[`popover-content`], styles[opened ? 'opened' : 'closed'], isDark && styles.dark)}>
      {children}
    </div>
  );
};
