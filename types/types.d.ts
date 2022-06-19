import {BrowserName} from '@mdn/browser-compat-data/types';

export type InternalSupportStatement = SupportStatement | 'mirror';

export type Exposure = 'Window' | 'Worker' | 'SharedWorker' | 'ServiceWorker';

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
