import { useSharedState } from '~/features/native-methods/hooks/use-shared-data';

export const useIsSending = () => {
  const [isSending, setIsSending] = useSharedState<boolean>(['is-sending'], false);
  return { isSending, setIsSending };
};
