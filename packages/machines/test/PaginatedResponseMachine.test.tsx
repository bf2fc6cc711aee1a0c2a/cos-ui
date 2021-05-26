import { interpret, createMachine } from 'xstate';
import { createModel } from 'xstate/lib/model';
import {
  makePaginatedApiMachine,
  ApiCallback,
  paginatedApiMachineEvents,
} from '../src';

describe('@cos-ui/machines', () => {
  describe('makePaginatedApiMachine', () => {
    beforeEach(jest.clearAllMocks);

    const API_LATENCY = 1000;
    jest.useFakeTimers();

    type TestResultType = { foo: string };
    type TestQueryType = { bar: string };

    const makeRequestData = (size: number) =>
      Array(size).fill({ foo: 'it works' });

    let loadingPayload: any = undefined;
    let responsePayload: any = undefined;
    const onCancelTimerSpy = jest.fn();
    const onLoadingSpy = jest.fn((_, { type, ...context }) => {
      loadingPayload = context;
    });
    const onSuccessSpy = jest.fn((_, { type, ...context }) => {
      responsePayload = context;
    });
    const onErrorSpy = jest.fn((_, { type, ...context }) => {
      responsePayload = context;
    });

    const testApi: ApiCallback<TestResultType, TestQueryType> = jest.fn(
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
              items: makeRequestData(request.size),
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

    const paginatedApiMachine = makePaginatedApiMachine<
      TestResultType,
      TestQueryType
    >(testApi);

    const testModel = createModel(
      {},
      {
        events: {
          success: () => ({}),
          error: () => ({}),
          ...paginatedApiMachineEvents,
        },
      }
    );

    const ID = 'paginatedApiMachineId';

    const testMachine = createMachine<typeof testModel>({
      id: 'test-pagination',
      initial: 'testing',
      states: {
        testing: {
          invoke: {
            id: ID,
            src: paginatedApiMachine,
            autoForward: true,
          },
        },
      },
      on: {
        loading: { actions: onLoadingSpy },
        success: { actions: onSuccessSpy },
        error: { actions: onErrorSpy },
      },
    });

    const testService = interpret(testMachine).start();

    it('starts idle', () => {
      expect(testApi).not.toBeCalled();
      expect(onCancelTimerSpy).toBeCalledTimes(0);
      expect(onLoadingSpy).toBeCalledTimes(0);
      expect(onSuccessSpy).toBeCalledTimes(0);
      expect(onErrorSpy).toBeCalledTimes(0);
    });

    it("doesn't change page before getting a response", () => {
      testService.send('nextPage');
      jest.runAllTimers();
      testService.send('prevPage');
      jest.runAllTimers();
      expect(responsePayload).toBeUndefined();
      expect(testApi).toBeCalledTimes(0);
      expect(onCancelTimerSpy).toBeCalledTimes(0);
      expect(onLoadingSpy).toBeCalledTimes(0);
      expect(onSuccessSpy).toBeCalledTimes(0);
      expect(onErrorSpy).toBeCalledTimes(0);
    });

    it('can query', () => {
      testService.send('query', { page: 1, size: 3 });
      jest.runAllTimers();
      expect(loadingPayload).toEqual(
        expect.objectContaining({ size: 3, page: 1 })
      );
      expect(responsePayload).toEqual(
        expect.objectContaining({
          total: 100,
          items: makeRequestData(3),
        })
      );
      expect(testApi).toBeCalledTimes(1);
      expect(onCancelTimerSpy).toBeCalledTimes(0);
      expect(onLoadingSpy).toBeCalledTimes(1);
      expect(onSuccessSpy).toBeCalledTimes(1);
      expect(onErrorSpy).toBeCalledTimes(0);
    });

    it('can fetch next page', () => {
      testService.send('nextPage');
      jest.runAllTimers();
      expect(loadingPayload).toEqual(
        expect.objectContaining({ size: 3, page: 2 })
      );
      expect(responsePayload).toEqual(
        expect.objectContaining({
          total: 100,
          items: makeRequestData(3),
          error: undefined,
        })
      );
      expect(testApi).toBeCalledTimes(1);
      expect(onCancelTimerSpy).toBeCalledTimes(0);
      expect(onLoadingSpy).toBeCalledTimes(1);
      expect(onSuccessSpy).toBeCalledTimes(1);
      expect(onErrorSpy).toBeCalledTimes(0);
    });

    it('properly sets an error on failed fetch', () => {
      testService.send('nextPage');
      jest.runAllTimers();
      expect(loadingPayload).toEqual(
        expect.objectContaining({ size: 3, page: 3 })
      );
      expect(responsePayload).toEqual(
        expect.objectContaining({
          error: 'error message',
        })
      );
      expect(testApi).toBeCalledTimes(1);
      expect(onCancelTimerSpy).toBeCalledTimes(0);
      expect(onLoadingSpy).toBeCalledTimes(1);
      expect(onSuccessSpy).toBeCalledTimes(0);
      expect(onErrorSpy).toBeCalledTimes(1);
    });

    it('unset the error on a successive fetch', () => {
      testService.send('prevPage');
      jest.runAllTimers();
      expect(loadingPayload).toEqual(
        expect.objectContaining({ size: 3, page: 2 })
      );
      expect(responsePayload).toEqual(
        expect.objectContaining({
          items: makeRequestData(3),
          total: 100,
          error: undefined,
        })
      );
      expect(testApi).toBeCalledTimes(1);
      expect(onCancelTimerSpy).toBeCalledTimes(0);
      expect(onLoadingSpy).toBeCalledTimes(1);
      expect(onSuccessSpy).toBeCalledTimes(1);
      expect(onErrorSpy).toBeCalledTimes(0);
    });

    it('can query with a complete request object', () => {
      testService.send('query', {
        page: 1,
        size: 4,
        query: { bar: 'test bar' },
      });
      jest.runAllTimers();
      expect(loadingPayload).toEqual(
        expect.objectContaining({
          page: 1,
          size: 4,
          query: { bar: 'test bar' },
        })
      );
      expect(responsePayload).toEqual(
        expect.objectContaining({
          items: makeRequestData(4),
          total: 100,
          error: undefined,
        })
      );
      expect(testApi).toBeCalledTimes(1);
      expect(onCancelTimerSpy).toBeCalledTimes(0);
      expect(onLoadingSpy).toBeCalledTimes(1);
      expect(onSuccessSpy).toBeCalledTimes(1);
      expect(onErrorSpy).toBeCalledTimes(0);
    });

    it('can query with a partial request object', () => {
      testService.send('query', {
        query: { bar: 'test bar 2' },
      });
      jest.runAllTimers();
      expect(loadingPayload).toEqual(
        expect.objectContaining({
          page: 1,
          size: 4,
          query: { bar: 'test bar 2' },
        })
      );
      expect(responsePayload).toEqual(
        expect.objectContaining({
          items: makeRequestData(4),
          total: 100,
          error: undefined,
        })
      );
      expect(testApi).toBeCalledTimes(1);
      expect(onCancelTimerSpy).toBeCalledTimes(0);
      expect(onLoadingSpy).toBeCalledTimes(1);
      expect(onSuccessSpy).toBeCalledTimes(1);
      expect(onErrorSpy).toBeCalledTimes(0);
    });

    it('previous filters are unset', () => {
      testService.send('query', { page: 1, size: 6 });
      jest.runAllTimers();
      expect(loadingPayload).toEqual(
        expect.objectContaining({ page: 1, size: 6 })
      );
      expect(responsePayload).toEqual(
        expect.objectContaining({
          items: makeRequestData(6),
          total: 100,
          error: undefined,
        })
      );
      expect(testApi).toBeCalledTimes(1);
      expect(onCancelTimerSpy).toBeCalledTimes(0);
      expect(onLoadingSpy).toBeCalledTimes(1);
      expect(onSuccessSpy).toBeCalledTimes(1);
      expect(onErrorSpy).toBeCalledTimes(0);
    });

    it('cancels the running request if a new request is triggered', () => {
      testService.send('query', { page: 1, size: 6 });
      jest.advanceTimersByTime(API_LATENCY / 4);
      testService.send('query', { page: 4, size: 2 });
      jest.advanceTimersByTime(API_LATENCY / 4);
      testService.send('query', { page: 2, size: 2 });
      jest.runAllTimers();

      expect(loadingPayload).toEqual(
        expect.objectContaining({ page: 2, size: 2 })
      );
      expect(responsePayload).toEqual(
        expect.objectContaining({
          items: makeRequestData(2),
          total: 100,
          error: undefined,
        })
      );
      expect(testApi).toBeCalledTimes(3);
      expect(onCancelTimerSpy).toBeCalledTimes(2);
      expect(onLoadingSpy).toBeCalledTimes(3);
      expect(onSuccessSpy).toBeCalledTimes(1);
      expect(onErrorSpy).toBeCalledTimes(0);
    });
  });
});
