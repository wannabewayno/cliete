/* c8 ignore next */
export default class Shell {
  readonly args: string[];

  constructor(
    readonly shell = '',
    ...args: string[]
  ) {
    this.args = args.filter(Boolean);
  }

  static fromString(cmd: string) {
    const [shell, ...args] = cmd
      .replace(/'.+'|".+"/g, s => s.replace(/\s/g, '\x00').slice(1, -1))
      .split(' ')
      // biome-ignore lint/suspicious/noControlCharactersInRegex: Using a control character as it's very unlikely it will show up in commands.
      .map(v => v.replace(/\x00/g, ' '));

    return new Shell(shell, ...args);
  }
}
