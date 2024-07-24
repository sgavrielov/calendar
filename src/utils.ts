function dateFormat(date: string): string | undefined {
  if (!date) return;

  const month = date.split("/")[0];
  const day = date.split("/")[1];
  const year = date.split("/")[2];

  return `${year}-${month}-${day}`;
}
