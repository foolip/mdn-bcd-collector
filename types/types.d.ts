//
// mdn-bcd-collector: types/types.d.ts
// TypeScript definitions for the collector
//
// © Gooborg Studios
// See the LICENSE file for copyright details
//

import {BrowserName} from '@mdn/browser-compat-data/types';
import type * as WebIDL2 from 'webidl2';

export type InternalSupportStatement = SupportStatement | 'mirror';

export type Exposure = 'Window' | 'Worker' | 'SharedWorker' | 'ServiceWorker';

export type Resource =
  | {
      type: 'instance';
      src: string;
    }
  | {
      type: 'audio' | 'video';
      src: string[];
      subtitles?: {
        label: string;
        lang: string;
        src: string;
      };
    }
  | {
      type: 'image';
      src: string;
    };

export interface Resources {
  [resource: string]: Resource;
}

export interface Test {
  code: string;
  exposure: Exposure[];
  resources?: Resources;
}

export type Tests = Record<string, Test>;

export interface RawTestCodeExpr {
  property: string;
  owner?: string;
  inherit?: boolean;
}

export interface RawTest {
  raw: {
    code: string | RawTestCodeExpr | (string | RawTestCodeExpr)[];
    combinator?: string;
  };
  exposure: Exposure[];
  resources?: Resources;
}

export type RawTests = Record<string, RawTest>;

export type TestResultValue = boolean | null;

export interface TestResult {
  exposure: Exposure;
  name: string;
  result: TestResultValue;
  message?: string;
}

export interface TestResults {
  [key: string]: TestResult[];
}

export interface Report {
  __version: string;
  results: TestResults;
  userAgent: string;
}

export type BrowserSupportMap = Map<string, TestResultValue>;
export type SupportMap = Map<BrowserName, BrowserSupportMap>;
export type SupportMatrix = Map<string, SupportMap>;

export type Overrides = Array<
  string | Array<string, string, string, TestResultValue>
>;

export interface IDLFiles {
  [filename: string]: WebIDL2.IDLRootType[];
}
