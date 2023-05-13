export function removeUndefinedProps(data: any): any {
  const allKeys = Object.keys(data);

  return allKeys.reduce((aggregated, current) => {
    if (data[current] !== undefined) {
      aggregated[current] = data[current];
    }

    return aggregated;
  }, {});
}
