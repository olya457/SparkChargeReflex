export async function saveValue(key: string, value: unknown) {
  return { key, value };
}

export async function getValue(key: string) {
  return key;
}