export const getErrorMsg = (error: unknown): string => {
  if (error === undefined) {
    return 'Undefined Error';
  }
  return error instanceof Error ? error.message : JSON.stringify(error);
};
