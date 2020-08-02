export function zip<T1, T2>(lists: [Array<T1>, Array<T2>]): Array<[T1, T2]> {
  const [a, b] = lists;
  if (a.length !== b.length) {
    throw new Error(`Array lengths are not equal: ${a.length} vs ${b.length}`);
  }
  return a.map((item, index) => [item, b[index]]);
}