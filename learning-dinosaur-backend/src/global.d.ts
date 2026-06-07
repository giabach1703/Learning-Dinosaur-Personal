declare const process: {
  exit(arg0: number): unknown;
  env: {
    [key: string]: string | undefined;
  };
};

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  info: (...args: any[]) => void;
};
