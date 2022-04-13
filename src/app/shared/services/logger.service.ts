import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  log = console.log;

  info = console.info;

  debug = console.debug;

  error = console.error;

  clear = console.clear;

  warn = console.warn;

  trace = console.trace;
}
