import { Router } from 'express';

export function isRouter(value: any): value is Router {
  return Object.getPrototypeOf(value) === Router;
}
