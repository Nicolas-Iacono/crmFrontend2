export function uppercaseNameFields(payload, fields = ['nombre', 'apellido']) {
  if (!payload || typeof payload !== 'object') return payload;
  const out = { ...payload };
  for (const key of fields) {
    const v = out[key];
    if (typeof v === 'string') {
      out[key] = v.toUpperCase();
    }
  }
  return out;
}
