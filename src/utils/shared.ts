export const mapToObject = (inputMap: Map<string, unknown>): object => {
  const obj = {} as { [key: string]: unknown };
  inputMap.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};
