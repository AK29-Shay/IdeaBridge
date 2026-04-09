export function safeArray(value) {
  if (!Array.isArray(value)) return [];
  return value;
}

export function groupBy(array, key) {
  const result = {};
  safeArray(array).forEach((item) => {
    const value = item?.[key] ?? 'Unknown';
    result[value] = (result[value] ?? 0) + 1;
  });
  return result;
}

export function sumField(array, field) {
  return safeArray(array).reduce((sum, item) => sum + Number(item?.[field] ?? 0), 0);
}

export function parseDate(dateString) {
  const parsed = new Date(dateString);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function filterByCategoryAndRange(dataArray, category, from, to, dateKey = 'createdDate') {
  const fromDate = parseDate(from);
  const toDate = parseDate(to);

  return safeArray(dataArray).filter((item) => {
    const itemDate = parseDate(item?.[dateKey]);
    const categoryMatch = category === 'All' || !category || item?.category === category;

    if (!itemDate) return categoryMatch;

    const fromOk = !fromDate || itemDate >= fromDate;
    const toOk = !toDate || itemDate <= toDate;
    return categoryMatch && fromOk && toOk;
  });
}
