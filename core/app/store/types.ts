import { Action, Reducer, Store } from 'redux';
import { ThunkAction as ReduxThunkAction, ThunkDispatch as ReduxThunkDispatch } from 'redux-thunk';
import type { RootReducer } from './root-reducer';

/**
 * The type for a Redux store. Here we wrap the definition provided by
 * `redux` overloaded with our included middleware interfaces.
 */
export type StoreWrapper<T extends Reducer<any, any>> = Store<GetModelFromReducer<T>, GetActionTypesFromReducer<T>> & {
  dispatch: ReduxThunkDispatch<GetModelFromReducer<T>, void, GetActionTypesFromReducer<T>>;
};

/**
 * The type for a thunked Redux action. Here we wrap the definition provided by
 * `redux-thunk` with our custom `RootState` interface.
 */
export type ThunkActionWrapper<R = void, S extends Reducer<any, any> | {} = RootReducer> = ReduxThunkAction<
  R,
  S extends Reducer<any, any> ? GetModelFromReducer<S> : S,
  void,
  S extends Reducer<any, any> ? GetActionTypesFromReducer<S> : Action
>;

/**
 * The type for a thunked Redux dispatcher. Here we wrap the definition provided
 * by `redux-thunk` with our custom `RootState` interface.
 */
export type ThunkDispatchWrapper<S extends Reducer<any, any> | {} = RootReducer> = ReduxThunkDispatch<
  S extends Reducer<any, any> ? GetModelFromReducer<S> : S,
  void,
  S extends Reducer<any, any> ? GetActionTypesFromReducer<S> : Action
>;

export type GetModelFromReducer<T extends Reducer<any, any>> = T extends Reducer<infer P, any> ? P : never;
export type GetActionTypesFromReducer<T extends Reducer<any, any>> = T extends Reducer<any, infer P> ? P : never;
