/**
 * Lightweight, safe syntax highlighter.
 * Tokenizes code into structured tokens for accessible rendering without running scripts or using dangerouslySetInnerHTML.
 */

import { SnippetLanguage } from '../types';

export type TokenType =
  | 'keyword'
  | 'string'
  | 'number'
  | 'comment'
  | 'function'
  | 'operator'
  | 'punctuation'
  | 'type'
  | 'variable'
  | 'tag'
  | 'attr'
  | 'text';

export interface CodeToken {
  type: TokenType;
  content: string;
}

const JS_KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'import', 'export', 'from', 'default', 'class', 'extends', 'new', 'this',
  'try', 'catch', 'finally', 'throw', 'async', 'await', 'yield', 'switch',
  'case', 'break', 'continue', 'typeof', 'instanceof', 'in', 'of', 'interface',
  'type', 'enum', 'public', 'private', 'protected', 'implements', 'as', 'readonly'
]);

const PYTHON_KEYWORDS = new Set([
  'def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'is',
  'import', 'from', 'as', 'try', 'except', 'finally', 'raise', 'with', 'lambda',
  'pass', 'break', 'continue', 'and', 'or', 'not', 'yield', 'global', 'nonlocal',
  'True', 'False', 'None', 'async', 'await'
]);

const SQL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'UPDATE', 'DELETE', 'JOIN',
  'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'GROUP', 'BY', 'ORDER', 'ASC',
  'DESC', 'HAVING', 'LIMIT', 'OFFSET', 'CREATE', 'TABLE', 'ALTER', 'DROP',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'INDEX', 'UNION', 'ALL', 'AS',
  'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'EXISTS', 'LIKE', 'BETWEEN', 'CASE',
  'WHEN', 'THEN', 'END'
]);

const BASH_KEYWORDS = new Set([
  'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'in',
  'case', 'esac', 'function', 'return', 'exit', 'echo', 'export', 'source',
  'cd', 'mkdir', 'rm', 'cp', 'mv', 'grep', 'curl', 'git', 'npm', 'pnpm', 'yarn'
]);

export function tokenizeCode(code: string, language: SnippetLanguage): CodeToken[][] {
  const lines = code.split('\n');
  return lines.map((line) => tokenizeLine(line, language));
}

function tokenizeLine(line: string, language: SnippetLanguage): CodeToken[] {
  if (language === 'plaintext') {
    return [{ type: 'text', content: line || ' ' }];
  }

  const tokens: CodeToken[] = [];
  let index = 0;
  const len = line.length;

  while (index < len) {
    const remaining = line.slice(index);

    // Comments: // or /* or # or --
    if (
      (language === 'javascript' || language === 'typescript') &&
      remaining.startsWith('//')
    ) {
      tokens.push({ type: 'comment', content: remaining });
      break;
    }
    if ((language === 'python' || language === 'bash') && remaining.startsWith('#')) {
      tokens.push({ type: 'comment', content: remaining });
      break;
    }
    if (language === 'sql' && remaining.startsWith('--')) {
      tokens.push({ type: 'comment', content: remaining });
      break;
    }
    if ((language === 'html' || language === 'markdown') && remaining.startsWith('<!--')) {
      tokens.push({ type: 'comment', content: remaining });
      break;
    }

    // Strings: "..." or '...' or `...`
    const quoteChar = remaining[0];
    if (quoteChar === '"' || quoteChar === "'" || quoteChar === '`') {
      let stringEnd = index + 1;
      let escaped = false;
      while (stringEnd < len) {
        if (line[stringEnd] === '\\' && !escaped) {
          escaped = true;
          stringEnd++;
          continue;
        }
        if (line[stringEnd] === quoteChar && !escaped) {
          stringEnd++;
          break;
        }
        escaped = false;
        stringEnd++;
      }
      tokens.push({ type: 'string', content: line.slice(index, stringEnd) });
      index = stringEnd;
      continue;
    }

    // Numbers: digits and hex
    const numberMatch = remaining.match(/^(\b0x[0-9a-fA-F]+\b|\b\d+(\.\d+)?\b)/);
    if (numberMatch) {
      tokens.push({ type: 'number', content: numberMatch[0] });
      index += numberMatch[0].length;
      continue;
    }

    // HTML / XML Tags: <tag or </tag>
    if (language === 'html') {
      const tagMatch = remaining.match(/^(<\/?[a-zA-Z0-9_-]+|\/?>)/);
      if (tagMatch) {
        tokens.push({ type: 'tag', content: tagMatch[0] });
        index += tagMatch[0].length;
        continue;
      }
    }

    // Words / Identifiers
    const wordMatch = remaining.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
    if (wordMatch) {
      const word = wordMatch[0];
      let type: TokenType = 'text';

      if (language === 'javascript' || language === 'typescript') {
        if (JS_KEYWORDS.has(word)) {
          type = 'keyword';
        } else if (/^[A-Z][a-zA-Z0-9_]*$/.test(word)) {
          type = 'type';
        } else if (line[index + word.length] === '(') {
          type = 'function';
        }
      } else if (language === 'python') {
        if (PYTHON_KEYWORDS.has(word)) {
          type = 'keyword';
        } else if (line[index + word.length] === '(') {
          type = 'function';
        }
      } else if (language === 'sql') {
        if (SQL_KEYWORDS.has(word.toUpperCase())) {
          type = 'keyword';
        }
      } else if (language === 'bash') {
        if (BASH_KEYWORDS.has(word)) {
          type = 'keyword';
        }
      } else if (language === 'json') {
        if (word === 'true' || word === 'false' || word === 'null') {
          type = 'keyword';
        }
      }

      tokens.push({ type, content: word });
      index += word.length;
      continue;
    }

    // Operators and punctuation
    const char = remaining[0];
    if (/[{}()[\].,;:?]/.test(char)) {
      tokens.push({ type: 'punctuation', content: char });
      index++;
      continue;
    }
    if (/[=+\-*/%&|^!<>~]/.test(char)) {
      tokens.push({ type: 'operator', content: char });
      index++;
      continue;
    }

    // Whitespace or unknown character
    tokens.push({ type: 'text', content: char });
    index++;
  }

  return tokens.length > 0 ? tokens : [{ type: 'text', content: ' ' }];
}

export function getTokenClassName(type: TokenType): string {
  switch (type) {
    case 'keyword':
      return 'text-indigo-400 font-semibold';
    case 'string':
      return 'text-emerald-300';
    case 'number':
      return 'text-amber-300';
    case 'comment':
      return 'text-slate-500 italic';
    case 'function':
      return 'text-sky-300';
    case 'type':
      return 'text-purple-300';
    case 'operator':
      return 'text-pink-400';
    case 'punctuation':
      return 'text-slate-400';
    case 'tag':
      return 'text-rose-400 font-semibold';
    case 'attr':
      return 'text-amber-200';
    default:
      return 'text-slate-200';
  }
}
