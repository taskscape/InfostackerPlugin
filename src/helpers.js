import { FileSizeLimitError } from "./errors";

const FILE_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB in bytes

async function formDataToBuffer(form, boundary) {
  const parts = [];

  for (const [name, value] of form) {
    if (typeof value === "string") {
      const header = `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n`;
      parts.push(new TextEncoder().encode(header + value + "\r\n"));
    } else {
      const header =
        `--${boundary}\r\nContent-Disposition: form-data; name="${name}"` +
        (value.name ? `; filename="${value.name}"` : "") +
        `\r\nContent-Type: ${value.type || "application/octet-stream"}\r\n\r\n`;
      parts.push(new TextEncoder().encode(header));

      const buffer = await value.arrayBuffer();
      if (buffer.byteLength > FILE_SIZE_LIMIT) {
        throw new FileSizeLimitError();
      }
      parts.push(new Uint8Array(buffer));

      parts.push(new TextEncoder().encode("\r\n"));
    }
  }

  parts.push(new TextEncoder().encode(`--${boundary}--\r\n`));

  let totalLength = 0;
  for (const part of parts) {
    totalLength += part.byteLength;
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.byteLength;
  }

  return result.buffer;
}

export { formDataToBuffer as default };
