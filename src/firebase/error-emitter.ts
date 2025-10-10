// A simple, typed event emitter for handling global application events.
// This is used to decouple the error source from the error handler.

type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

interface Emitter<T extends EventMap> {
  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}

export function createEmitter<T extends EventMap>(): Emitter<T> {
  const listeners: {
    [K in keyof T]?: Array<EventReceiver<T[K]>>;
  } = {};

  return {
    on(eventName, fn) {
      listeners[eventName] = (listeners[eventName] || []).concat(fn);
    },
    off(eventName, fn) {
      listeners[eventName] = (listeners[eventName] || []).filter(
        (f) => f !== fn
      );
    },
    emit(eventName, params) {
      (listeners[eventName] || []).forEach(function (fn) {
        fn(params);
      });
    },
  };
}

// App-specific error event map.
import type { FirestorePermissionError } from './errors';
interface ErrorEvents {
  'permission-error': FirestorePermissionError;
}

// Export a singleton instance of the error emitter.
export const errorEmitter = createEmitter<ErrorEvents>();
