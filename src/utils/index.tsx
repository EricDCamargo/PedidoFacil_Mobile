const formatCurrency = (value: string | number) => {
  const floatValue = parseFloat(value.toString())

  if (isNaN(floatValue)) return ''

  if (isNaN(floatValue)) return ''
  return floatValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  })
}

export { formatCurrency }
