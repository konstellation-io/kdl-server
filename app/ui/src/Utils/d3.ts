export function stringToId(text: string) {
  return text.replace(/\s+/g, '-');
}

export function px(value: number | string) {
  return `${value}px`;
}
