import _ from 'lodash';

export const mapToObject = (inputMap: Map<string, unknown>): object => {
  const obj = {} as { [key: string]: unknown };
  inputMap.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

/**
 * Returns a new object that does not contain empty objects as values
 * and leaves the passed in value untouched.
 * @param obj
 * @returns
 */
export const clearEmptyObjectValues = (obj: any): any => {
  const answer: any = { ...obj };
  Object.keys(answer).map((key) => {
    const value = answer[key];
    if (typeof value === 'object' && Object.keys(value).length === 0) {
      answer[key] = '';
    }
  });
  return answer;
};
