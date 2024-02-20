export function removeUndefinedProps(data: any): any {
  const allKeys = Object.keys(data);

  return allKeys.reduce((aggregated, current) => {
    if (data[current] !== undefined) {
      aggregated[current] = data[current];
    }

    return aggregated;
  }, {});
}

export const tryParseStringIntoCorrectData = (data: string): any => {
  if (!data?.length) {
    return;
  }

  try {
    // Parse boolean
    if (data === "true") {
      return true;
    }

    if (data === "false") {
      return false;
    }

    // Parse number
    const dataAsNumber = Number(data);

    if (!Number.isNaN(dataAsNumber)) {
      return dataAsNumber;
    }

    // Parse object
    const parsedObject = JSON.parse(data);

    return parsedObject;
  } catch (error) {
    return data;
  }
};
