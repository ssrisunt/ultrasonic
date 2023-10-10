export * from './models/base';
type ObjToArrayParams = Record<string, string>;

const keyTypeTran = {
  string: String,
  number: Number,
};
/**
 * obj into an array of values and labels
 * @param _obj
 */
export const objToArray = (_obj: ObjToArrayParams, keyType: string = 'string') => {
  return Object.keys(_obj).map((key) => {
    return {
      value: keyTypeTran[keyType](key),
      label: _obj[key],
    };
  });
};

type EnumToArrayItem = {
  value: number;
  label: string;
  showSelect?: boolean;
};
export type EnumToArrayParams = Record<string, EnumToArrayItem>;

export const enumToArray = (_obj: EnumToArrayParams) => {
  return Object.keys(_obj).map((key) => {
    return _obj[key];
  });
};

// 枚举类转出的key value列表转key value对象
export const enumArrayTrans = (_array: EnumToArrayItem[]) => {
  const returnObj = {};
  _array.map((item) => {
    returnObj[item.value] = item.label;
    return item;
  });
  return returnObj;
};
