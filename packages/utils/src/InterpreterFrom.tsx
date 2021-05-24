import { Interpreter, StateMachine } from 'xstate';

export type InterpreterFrom<
  T extends StateMachine<any, any, any, any>
> = T extends StateMachine<
  infer TContext,
  infer TStateSchema,
  infer TEvent,
  infer TTypestate
>
  ? Interpreter<TContext, TStateSchema, TEvent, TTypestate>
  : never;
