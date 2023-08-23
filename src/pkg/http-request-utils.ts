export function constructUrlQueryString(
  url: string,
  queryStringData: any,
  options?: { encodeUrl?: boolean }
): string {
  if (!queryStringData) {
    return url;
  }

  const encoder = options?.encodeUrl
    ? encodeURIComponent
    : (value: any) => value;

  const rawQueryString = [];
  for (const props in queryStringData) {
    const propValue = queryStringData[props];
    if (propValue === undefined || propValue === null) {
      continue;
    }

    if (typeof propValue === "object") {
      rawQueryString.push(`${props}=${encoder(JSON.stringify(propValue))}`);
    } else {
      rawQueryString.push(`${props}=${encoder(propValue)}`);
    }
  }

  return `${url}?${rawQueryString.join("&")}`;
}

const MASK_FIELDS = ["password", "secret"];

export function maskSensitiveData(
  data: any,
  maskFields: string[] = MASK_FIELDS
): Record<string, any> {
  // It is a string, number, or whatever. We don't process
  if (typeof data !== "object") {
    return data;
  }

  // Data is an object
  if (!Array.isArray(data)) {
    const maskedData = Object.assign({}, data || {});
    const keys = Object.keys(data);

    keys.forEach((key) => {
      let value = data[key];

      if (!value) {
        return;
      }

      if (typeof value === "object") {
        value = maskSensitiveData(value, maskFields);

        maskedData[key] = value;

        return;
      }

      // Key is not sensitive
      if (!maskFields.includes(key)) {
        return;
      }

      maskedData[key] = "***";
    });

    return maskedData;
  }

  // Data is an array
  return data.map((i) => maskSensitiveData(i, maskFields));
}
