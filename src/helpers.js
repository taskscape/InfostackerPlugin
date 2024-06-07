import { isErrored as streamIsErrored } from "stream";
import { inspect } from "util";

async function streamToString(data) {
  const reader = data.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

function isErrored(body) {
  return !!(body && (streamIsErrored ? streamIsErrored(body) : /state: 'errored'/.test(inspect(body))));
}

function isBuffer(buffer) {
  return buffer instanceof Uint8Array || Buffer.isBuffer(buffer);
}

async function extractBody(object, newBoundary) {
  let source = null;
  let length = 0;
  const boundary = newBoundary || `formdata-boundary`;
  const rn = new Uint8Array([13, 10]); 
  const blobParts = [];

  for (const [name, value] of object) {
    if (typeof value === "string") {
      const header = `--${boundary}\r\nContent-Disposition: form-data; name="${escape(name)}"\r\n\r\n`;
      const chunk = new TextEncoder().encode(header + value + '\r\n');
      blobParts.push(chunk);
      length += chunk.byteLength;
    } else {
      const header = `--${boundary}\r\nContent-Disposition: form-data; name="${escape(name)}"${value.name ? `; filename="${escape(value.name)}"` : ""}\r\nContent-Type: ${value.type || "application/octet-stream"}\r\n\r\n`;
      const chunk = new TextEncoder().encode(header);
      blobParts.push(chunk);
      if (value instanceof Blob) {
        const buffer = await value.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');
        const base64Chunk = new TextEncoder().encode(base64Data);
        blobParts.push(base64Chunk);
        length += base64Chunk.byteLength;
      } else {
        blobParts.push(value);
        length += value.size;
      }
      blobParts.push(rn);
      length += chunk.byteLength + rn.byteLength;
    }
  }

  const finalChunk = new TextEncoder().encode(`--${boundary}--\r\n`);
  blobParts.push(finalChunk);
  length += finalChunk.byteLength;

  const action = async function* () {
    for (const part of blobParts) {
      if (part instanceof Uint8Array || part instanceof ArrayBuffer) {
        yield part;
      } else if (part.stream) {
        const reader = part.stream().getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          yield value;
        }
      }
    }
  };

  const type = `multipart/form-data; boundary=${boundary}`;

  if (typeof source === "string" || isBuffer(source)) {
    length = Buffer.byteLength(source);
  }

  let iterator;
  const stream = new ReadableStream({
    async start() {
      iterator = action()[Symbol.asyncIterator]();
    },
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        queueMicrotask(() => {
          controller.close();
        });
      } else if (!isErrored(stream)) {
        controller.enqueue(new Uint8Array(value));
      }
      return controller.desiredSize > 0;
    },
    async cancel() {
      await iterator.return();
    },
    type: void 0
  });

  return {
    body: {
      stream,
      source,
      length
    },
    type
  };
}

async function formDataToString(form, boundary) {
  const { body: { stream } } = await extractBody(form, boundary);
  return streamToString(stream);
}

export {
  formDataToString as default
};