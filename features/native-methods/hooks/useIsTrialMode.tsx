import { useEffect, useState } from 'react';
import { getIsTrialMode } from '~/app/ui/components/widgets/trial-mode-banner';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';

export const useIsTrialMode = () => {
  const payload = useUIThreadPayload();
  const [isTrialMode, setIsTrialMode] = useState(false);

  useEffect(() => {
    setIsTrialMode(payload ? getIsTrialMode(payload?.method) : false);
  }, []);

  return { isTrialMode };
};
