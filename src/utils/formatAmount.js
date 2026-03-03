const formatAmount = (value) => {
  const normalized = String(value).replace(',', '.');
  const parsed = parseFloat(normalized);
  if (isNaN(parsed)) return '0,00';
  return parsed.toFixed(2).replace('.', ',');
};

export default formatAmount;
