export interface Page<T> {
    content: T[];
    totalElements: number;
    number: number;
    size: number;
    last: boolean;
    first: boolean;
    empty: boolean;
  }