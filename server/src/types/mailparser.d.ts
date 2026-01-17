declare module "mailparser" {
  export interface AddressObject {
    value: Array<{
      address: string;
      name: string;
    }>;
    html: string;
    text: string;
  }

  export interface ParsedMail {
    attachments: any[];
    headers: Map<string, any>;
    html?: string | false;
    text?: string;
    textAsHtml?: string;
    subject?: string;
    date?: Date;
    to?: AddressObject;
    from?: AddressObject;
    cc?: AddressObject;
    bcc?: AddressObject;
    replyTo?: AddressObject;
    messageId?: string;
    inReplyTo?: string;
    references?: string | string[];
    priority?: "high" | "normal" | "low";
  }

  export function simpleParser(
    source: any,
    callback?: (err: Error | null, parsed: ParsedMail) => void,
  ): Promise<ParsedMail>;
}
