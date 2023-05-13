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

    if (typeof propValue === 'object') {
      rawQueryString.push(`${props}=${encoder(JSON.stringify(propValue))}`);
    } else {
      rawQueryString.push(`${props}=${encoder(propValue)}`);
    }
  }

  return `${url}?${rawQueryString.join('&')}`;
}
