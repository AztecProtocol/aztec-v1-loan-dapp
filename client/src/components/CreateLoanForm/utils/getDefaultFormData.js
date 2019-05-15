export default function getDefaultFormData(fieldsConfig) {
  const data = {};
  fieldsConfig
    .filter(({
      defaultValue,
    }) => defaultValue !== undefined)
    .forEach(({
      fieldName,
      defaultValue,
    }) => {
      data[fieldName] = defaultValue;
    });

  return data;
};
