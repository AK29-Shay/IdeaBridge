const parseDate = (value) => {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildCategoryAndDateQuery = ({
  category,
  dateFrom,
  dateTo,
  dateField
}) => {
  const query = {};
  const fromDate = parseDate(dateFrom);
  const toDate = parseDate(dateTo);

  if (category && category !== 'All') {
    query.category = category;
  }

  if (fromDate || toDate) {
    query[dateField] = {};

    if (fromDate) {
      query[dateField].$gte = fromDate;
    }

    if (toDate) {
      query[dateField].$lte = toDate;
    }
  }

  return query;
};

const isResolvedRequest = (status) => status === 'answered' || status === 'completed';

export { buildCategoryAndDateQuery, isResolvedRequest };
