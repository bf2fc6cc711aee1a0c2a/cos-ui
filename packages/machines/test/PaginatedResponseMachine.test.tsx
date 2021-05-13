import { interpret } from 'xstate';
import { makePaginatedApiMachine, ApiCallback } from '../src';
describe('@cos-ui/machines', () => {
  describe('makePaginatedApiMachine', () => {
    beforeEach(jest.clearAllMocks);

    const API_LATENCY = 1000;
    jest.useFakeTimers();

    type TestType = Array<{ foo: string }>;

    const makeRequestData = (size: number) =>
      Array(size).fill({ foo: 'it works' });

    const onLoadingSpy = jest.fn();
    const onIdleSpy = jest.fn();
    const onCancelTimerSpy = jest.fn();

    const testApi: ApiCallback<TestType> = jest.fn(
      (request, onSuccess, onError) => {
        if (request.page === 0) {
          fail("can't fetch page 0");
        }
        let timer: NodeJS.Timeout | undefined;
        if (request.page === 1 || request.page === 2) {
          timer = global.setTimeout(() => {
            onSuccess({
              page: request.page,
              size: request.size,
              total: 100,
              data: makeRequestData(request.size),
            });
            timer = undefined;
          }, API_LATENCY);
        }
        if (request.page > 2) {
          timer = global.setTimeout(() => {
            onError({ page: request.page, error: 'error message' });
            timer = undefined;
          }, API_LATENCY);
        }
        return () => {
          if (timer) {
            onCancelTimerSpy();
            clearTimeout(timer);
            timer = undefined;
          }
        };
      }
    );

    const testMachine = makePaginatedApiMachine<TestType>(testApi);

    let state: any = [];
    const testService = interpret(testMachine)
      .onTransition(s => {
        if (s.value === 'loading') onLoadingSpy();
        if (s.value === 'idle') onIdleSpy();
        state = s;
      })
      .start();

    it('starts uninitialized', () => {
      expect(testService.initialState.value).toBe('idle');
      expect(testService.initialState.context).toEqual({
        request: { size: 0, page: 0 },
        total: 0,
      });
      expect(testApi).not.toBeCalled();
    });

    it('can query', () => {
      testService.send('query', { page: 1, size: 3 });
      jest.runAllTimers();
      expect(state.context).toEqual(
        expect.objectContaining({
          request: { size: 3, page: 1 },
          total: 100,
          data: makeRequestData(3),
        })
      );
      expect(testApi).toBeCalledTimes(1);
      expect(onIdleSpy).toBeCalledTimes(1);
      expect(onLoadingSpy).toBeCalledTimes(1);
      expect(onCancelTimerSpy).toBeCalledTimes(0);
    });

    it('can fetch next page', () => {
      testService.send('nextPage');
      jest.runAllTimers();
      expect(state.context).toEqual(
        expect.objectContaining({
          request: { size: 3, page: 2 },
          total: 100,
          data: makeRequestData(3),
        })
      );
      expect(testApi).toBeCalledTimes(1);
      expect(onIdleSpy).toBeCalledTimes(1);
      expect(onLoadingSpy).toBeCalledTimes(1);
      expect(onCancelTimerSpy).toBeCalledTimes(0);
    });

    it('properly sets an error on failed fetch', () => {
      testService.send('nextPage');
      jest.runAllTimers();
      expect(state.context).toEqual(
        expect.objectContaining({
          request: { size: 3, page: 3 },
          total: 100,
          data: undefined,
          error: 'error message',
        })
      );
      expect(testApi).toBeCalledTimes(1);
      expect(onIdleSpy).toBeCalledTimes(1);
      expect(onLoadingSpy).toBeCalledTimes(1);
      expect(onCancelTimerSpy).toBeCalledTimes(0);
    });

    it('unset the error on a successive fetch', () => {
      testService.send('prevPage');
      jest.runAllTimers();
      expect(state.context).toEqual(
        expect.objectContaining({
          request: { size: 3, page: 2 },
          data: makeRequestData(3),
          error: undefined,
        })
      );
    });

    it('sets extra filters, previous page and size are kept', () => {
      testService.send('query', { foo: 'test foo' });
      jest.runAllTimers();
      expect(state.context).toEqual(
        expect.objectContaining({
          request: { page: 2, size: 3, foo: 'test foo' },
          data: makeRequestData(3),
        })
      );
      expect(testApi).toBeCalledTimes(1);
      expect(onIdleSpy).toBeCalledTimes(1);
      expect(onLoadingSpy).toBeCalledTimes(1);
      expect(onCancelTimerSpy).toBeCalledTimes(0);
    });

    it('previous filters are unset', () => {
      testService.send('query', { page: 1, size: 6 });
      jest.runAllTimers();
      expect(state.context).toEqual(
        expect.objectContaining({
          request: { page: 1, size: 6 },
          data: makeRequestData(6),
        })
      );
      expect(testApi).toBeCalledTimes(1);
      expect(onIdleSpy).toBeCalledTimes(1);
      expect(onLoadingSpy).toBeCalledTimes(1);
      expect(onCancelTimerSpy).toBeCalledTimes(0);
    });

    it('cancels the running request if a new request is triggered', () => {
      testService.send('query', { page: 1, size: 6 });
      jest.advanceTimersByTime(API_LATENCY / 2);
      testService.send('query', { page: 4, size: 2 });
      jest.advanceTimersByTime(API_LATENCY / 2);
      testService.send('query', { page: 2, size: 2 });
      jest.advanceTimersByTime(API_LATENCY);

      expect(state.context).toEqual(
        expect.objectContaining({
          request: { page: 2, size: 2 },
          data: makeRequestData(2),
        })
      );
      expect(testApi).toBeCalledTimes(3);
      expect(onIdleSpy).toBeCalledTimes(1);
      expect(onLoadingSpy).toBeCalledTimes(3);
      expect(onCancelTimerSpy).toBeCalledTimes(2);
    });
  });
});
