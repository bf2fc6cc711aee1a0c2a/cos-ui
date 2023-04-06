import { AlertContext, AlertProps, AlertVariant } from '@hooks/useAlert';
import React, { FunctionComponent, useEffect, useState } from 'react';

import {
  AlertGroup,
  Alert,
  AlertActionCloseButton,
} from '@patternfly/react-core';

type TimeOut = {
  key: string | undefined;
  timeOut: ReturnType<typeof setTimeout> | undefined;
};

export type TestAlertProps = AlertProps & { dataTestId?: string };

/**
 * Mocks the behaviour of notifications on console.redhat.com
 */
export const AlertsProvider: FunctionComponent = ({ children }) => {
  const [alerts, setAlerts] = useState<TestAlertProps[]>([]);
  const [timers, setTimers] = useState<TimeOut[]>([]);

  useEffect(() => {
    const timersKeys = timers.map((timer) => timer.key);
    const timeOuts = alerts
      .filter((alert) => !timersKeys.includes(alert?.id))
      .map((alert) => {
        const { id = '' } = alert;
        const timeOut: ReturnType<typeof setTimeout> = setTimeout(
          () => hideAlert(id),
          8000
        );
        return { key: alert.id, timeOut } as TimeOut;
      });
    setTimers([...timers, ...timeOuts]);
    return () =>
      timers.forEach((timer) => timer?.timeOut && clearTimeout(timer.timeOut));
    // enabling this will cause an infinite render loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts]);

  const createId = () => new Date().getTime();

  const hideAlert = (key: string | undefined) => {
    setAlerts((alerts) => [...alerts.filter((el) => el.id !== key)]);
    setTimers((timers) => [...timers.filter((timer) => timer.key === key)]);
  };

  const addAlert = (props: AlertProps) => {
    const id = createId().toString();
    setAlerts([...alerts, { ...props, id }]);
  };

  return (
    <AlertContext.Provider value={{ addAlert }}>
      <AlertToastGroup alerts={alerts} onCloseAlert={hideAlert} />
      {children}
    </AlertContext.Provider>
  );
};

type AlertToastGroupProps = {
  alerts: AlertProps[];
  onCloseAlert: (key: string | undefined) => void;
};

export const AlertToastGroup: React.FunctionComponent<AlertToastGroupProps> = ({
  alerts,
  onCloseAlert,
}: AlertToastGroupProps) => {
  return (
    <AlertGroup isToast>
      {alerts.map(
        ({
          id,
          variant,
          title,
          description,
          dataTestId,
          ...rest
        }: TestAlertProps) => (
          <Alert
            key={id}
            isLiveRegion
            variant={AlertVariant[variant]}
            variantLabel=""
            title={title}
            actionClose={
              <AlertActionCloseButton
                title={title}
                onClose={() => onCloseAlert(id)}
              />
            }
            data-testid={dataTestId}
            {...rest}
          >
            {description}
          </Alert>
        )
      )}
    </AlertGroup>
  );
};
