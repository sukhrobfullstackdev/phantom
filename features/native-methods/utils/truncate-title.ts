const MAX_TITLE_LENGTH = 56;

export const truncateTitle = (title: string, length?: number) => {
  const maxLength = length || MAX_TITLE_LENGTH;
  return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
};
