export const range = n =>
  Array.from(Array(n).keys())

export const repeat = (n, x) =>
  range(n).map(() => x)

export const vectorsAsArrays = vectors =>
  vectors.map(vector => vector.toArray())
