/**
 * Extracts all matches of a pattern from text and returns both the matches and the modified text.
 *
 * @param text - The input text to search within
 * @param regex - Pattern to match (RegExp or string). For RegExp, use global flag for multiple matches
 * @returns A tuple containing [array of all extracted matches, text with all matches removed]
 *
 * @example
 * // Extract all error codes from output
 * const [errorCodes, cleanOutput] = extractAll('Errors: E001, E002, E003 found', /E\d+/g);
 * // errorCodes: ['E001', 'E002', 'E003']
 * // cleanOutput: 'Errors: , ,  found'
 *
 * // Extract all file paths
 * const [files, message] = extractAll('Files: /path/file1.txt and /path/file2.txt', /\/\S+\.txt/g);
 * // files: ['/path/file1.txt', '/path/file2.txt']
 * // message: 'Files:  and '
 *
 * // No matches found
 * const [nothing, original] = extractAll('Hello world', /\d+/g);
 * // nothing: []
 * // original: 'Hello world'
 */
export default function extractAll(text: string, regex: RegExp | string): [extracted: string[], modified: string] {
  regex =
    typeof regex === 'string'
      ? new RegExp(regex, 'g')
      : !regex.global
        ? new RegExp(regex.source, `g${regex.flags}`)
        : regex;

  const extracted: string[] = [];
  text = text.replace(regex, match => {
    extracted.push(match);
    return '';
  });

  return [extracted, text];
}
