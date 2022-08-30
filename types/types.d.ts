//
// mdn-bcd-collector: types/types.d.ts
// TypeScript definitions for the collector
//
// © Gooborg Studios
// See the LICENSE file for copyright details
//

import {BrowserName} from '@mdn/browser-compat-data/types';

export type InternalSupportStatement = SupportStatement | 'mirror';

export type Exposure = 'Window' | 'Worker' | 'SharedWorker' | 'ServiceWorker';

export interface Test {
  code: string;
  exposure: Exposure[];
}

export type Tests = Record<string, Test>;

export type TestResultValue = boolean | null;

export interface TestResult {
  exposure: Exposure;
  name: string;
  result: TestResultValue;
  message?: string;
}

export interface Report {
  __version: string;
  results: {
    [key: string]: TestResult[];
  };
  userAgent: string;
}

export type BrowserSupportMap = Map<string, TestResultValue>;
export type SupportMap = Map<BrowserName, BrowserSupportMap>;
export type SupportMatrix = Map<string, SupportMap>;

export type Overrides = Array<
  string | Array<string, string, string, TestResultValue>
>;
