import { Machine } from 'xstate';

const configuratorMachine = Machine({
  id: 'reddit',
  initial: 'idle',
  states: {
    idle: {},
    selected: {}
  }
});

export { configuratorMachine };
