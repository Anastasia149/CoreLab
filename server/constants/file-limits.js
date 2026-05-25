const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const ASSIGNMENT_FILE_MAX_BYTES = 25 * 1024 * 1024;

function formatFileSizeRu(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} КБ`;
  }
  const mb = bytes / (1024 * 1024);
  const rounded = Math.round(mb * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded} МБ` : `${rounded.toString().replace('.', ',')} МБ`;
}

module.exports = {
  AVATAR_MAX_BYTES,
  ASSIGNMENT_FILE_MAX_BYTES,
  formatFileSizeRu,
};
