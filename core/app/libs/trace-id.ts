export const addTraceIdToWindow = (trace_id: string) => {
  if (typeof window !== 'undefined') {
    window.trace_id = trace_id;
  }
};

export const getTraceIdFromWindow = () => {
  if (typeof window !== 'undefined') {
    return window?.trace_id;
  }
  return undefined;
};
