// A small, valid PNG generated in memory, so the suite needs no binary
// fixtures. Solid colour; the editor resizes and re-encodes it before upload.
import { crc32, deflateSync } from "node:zlib"

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, "ascii"), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

/** An RGB PNG of `width` × `height` filled with `rgb`. */
export function makePng(
  width = 96,
  height = 64,
  rgb: [number, number, number] = [201, 160, 90]
): Buffer {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8 // bit depth
  header[9] = 2 // colour type: RGB
  // compression, filter, interlace stay 0
  const row = Buffer.alloc(1 + width * 3)
  for (let x = 0; x < width; x++) row.set(rgb, 1 + x * 3)
  const raw = Buffer.concat(Array.from({ length: height }, () => row))
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

/** Width and height from a PNG's IHDR chunk (throws if it is not a PNG). */
export function pngSize(png: Buffer): { width: number; height: number } {
  if (png.subarray(1, 4).toString("ascii") !== "PNG") {
    throw new Error("Not a PNG")
  }
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) }
}
