/**
 * A polyfill for the TextDecoderStream class that provides a transform stream for decoding Uint8Array chunks into strings.
 * Currently bun does not support TextDecoderStream, so we need to polyfill it.
 * Ref: https://bun.sh/docs/runtime/nodejs-apis#textdecoderstream
 */
export class PolyfillTextDecoderStream extends TransformStream<Uint8Array, string> {
  /**
   * The encoding used for decoding the input chunks.
   */
  readonly encoding: string;

  /**
   * Indicates whether decoding errors should be fatal or not.
   */
  readonly fatal: boolean;

  /**
   * Indicates whether to ignore the Byte Order Mark (BOM) at the beginning of the input.
   */
  readonly ignoreBOM: boolean;

  /**
   * Creates a new instance of the PolyfillTextDecoderStream class.
   * @param encoding The encoding to use for decoding. Defaults to 'utf-8'.
   * @param options Additional options for the TextDecoder constructor.
   */
  constructor(
    encoding = 'utf-8',
    { fatal = false, ignoreBOM = false }: ConstructorParameters<typeof TextDecoder>[1] = {},
  ) {
    const decoder = new TextDecoder(encoding, { fatal, ignoreBOM });
    super({
      /**
       * Transforms a Uint8Array chunk into a decoded string and enqueues it for further processing.
       * @param chunk The input chunk to transform.
       * @param controller The controller for managing the transform stream.
       */
      transform(chunk: Uint8Array, controller: TransformStreamDefaultController<string>) {
        const decoded = decoder.decode(chunk);
        if (decoded.length > 0) {
          controller.enqueue(decoded);
        }
      },
      /**
       * Flushes any remaining decoded output and enqueues it for further processing.
       * @param controller The controller for managing the transform stream.
       */
      flush(controller: TransformStreamDefaultController<string>) {
        // If {fatal: false} is in options (the default), then the final call to
        // decode() can produce extra output (usually the unicode replacement
        // character 0xFFFD). When fatal is true, this call is just used for its
        // side-effect of throwing a TypeError exception if the input is
        // incomplete.
        const output = decoder.decode();
        if (output.length > 0) {
          controller.enqueue(output);
        }
      },
    });

    this.encoding = encoding;
    this.fatal = fatal;
    this.ignoreBOM = ignoreBOM;
  }
}
