export function stringToId(text: string) {
  return text?.replace(/[0-9]+/g, '').replace(/[\s()]+/g, '-');
}

export function px(value: number | string) {
  return `${value}px`;
}
