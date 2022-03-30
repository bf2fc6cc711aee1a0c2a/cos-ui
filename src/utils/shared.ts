import _ from 'lodash';

export const mapToObject = (inputMap: Map<string, unknown>): object => {
  const obj = {} as { [key: string]: unknown };
  inputMap.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

export const clearSecretEmptyValue = (obj: any) => {
  return Object.keys(obj).map((key) => {
    if (_.isEmpty((obj as { [key: string]: any })[key])) {
      (obj as { [key: string]: any })[key] = '';
    }
  });
};
