import { useEffect } from 'react';
import { useCompare } from 'usable-react';

export function useDocumentTitle(title: string) {
  const didTitleChange = useCompare(title);
  useEffect(() => {
    if (didTitleChange) document.title = title;
  }, [didTitleChange]);
}
