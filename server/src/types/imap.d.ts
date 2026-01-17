declare module "imap" {
  import { EventEmitter } from "events";

  export interface ImapOptions {
    user: string;
    password: string;
    host: string;
    port: number;
    tls?: boolean;
    tlsOptions?: {
      rejectUnauthorized?: boolean;
    };
    authTimeout?: number;
    connTimeout?: number;
  }

  export interface Box {
    name: string;
    messages: {
      total: number;
      new: number;
    };
  }

  export default class Imap extends EventEmitter {
    constructor(config: ImapOptions);
    connect(): void;
    end(): void;
    openBox(
      mailboxName: string,
      openReadOnly: boolean,
      callback: (err: Error | null, box: Box) => void,
    ): void;
    seq: {
      fetch(
        source: string,
        options: {
          bodies?: string | string[];
          struct?: boolean;
        },
      ): ImapFetch;
    };
  }

  export interface ImapFetch extends EventEmitter {
    on(
      event: "message",
      listener: (msg: ImapMessage, seqno: number) => void,
    ): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: "end", listener: () => void): this;
    once(
      event: "message",
      listener: (msg: ImapMessage, seqno: number) => void,
    ): this;
    once(event: "error", listener: (err: Error) => void): this;
    once(event: "end", listener: () => void): this;
  }

  export interface ImapMessage extends EventEmitter {
    on(
      event: "body",
      listener: (stream: NodeJS.ReadableStream, info: any) => void,
    ): this;
    on(event: "attributes", listener: (attrs: any) => void): this;
    once(
      event: "body",
      listener: (stream: NodeJS.ReadableStream, info: any) => void,
    ): this;
    once(event: "attributes", listener: (attrs: any) => void): this;
  }
}
