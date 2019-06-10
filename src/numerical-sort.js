function numericalSort(a, b, isDescending) {
  // Do case-insensitive sorting, so abc comes before Abcd.
  a = a.toLowerCase()
  b = b.toLowerCase()

  // Do the strings both begin with numbers?
  // The goal is to sort 1,2,10... not 1,10,2
  const regex = /^\d+/
  const matchA = a.match(regex)
  const matchB = b.match(regex)
  if (matchA && matchB) {
    // Both start with numbers, so we just sort the numbers.
    a = parseInt(matchA[0])
    b = parseInt(matchB[0])
  }

  if (a < b) {
    return isDescending ? 1 : -1
  }
  if (a > b) {
    return isDescending ? -1 : 1
  }
  return 0
}

export default numericalSort
