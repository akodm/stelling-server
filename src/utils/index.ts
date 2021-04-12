export const objCheck = (obj: any) => {
  const keys = Object.keys(obj);

  for(let e of keys) {
    if(!obj[e] ?? obj[e] === "") {
      return e;
    }
  }

  return false;
};