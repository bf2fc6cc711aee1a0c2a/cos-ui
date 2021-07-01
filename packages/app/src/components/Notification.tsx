import React, { useEffect, useState } from 'react';
import { AlertContext, AlertProps } from '@bf2/ui-shared';
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertVariant,
} from '@patternfly/react-core';

export type NotificationType = {
  key: number;
  title: string;
  autoDismiss?: boolean;
  dismissable?: boolean;
  variant: AlertVariant;
  description?: string | React.ReactElement;
  dismissDelay?: number;
};

type TimeOut = {
  key: number;
  timeOut: number | undefined;
};

export const NotificationProvider: React.FunctionComponent = ({ children }) => {
  const [notifications, pushNotifications] = useState<NotificationType[]>([]);
  const [timers, setTimers] = useState<TimeOut[]>([]);

  useEffect(() => {
    const timersKeys = timers.map(timer => timer?.key);
    const timeOuts = notifications
      .filter(notification => !timersKeys.includes(notification.key))
      .map(notification => {
        const timeOut = setTimeout(
          () => hideNotification(notification.key),
          notification.dismissDelay
        );
        return { key: notification.key, timeOut };
      });
    setTimers([...timers, ...timeOuts]);
    return () => timers.forEach(timer => clearTimeout(timer.timeOut));
  }, [notifications]);

  const hideNotification = (key: number) => {
    pushNotifications(notifications => [
      ...notifications.filter(el => el.key !== key),
    ]);
    setTimers(timers => [...timers.filter(timer => timer.key === key)]);
  };

  const createId = () => new Date().getTime();

  const addAlert = ({
    title,
    variant = AlertVariant.default,
    description,
    autoDismiss = true,
    dismissable = true,
    dismissDelay = 8 * 1000,
  }: AlertProps) => {
    pushNotifications([
      ...notifications,
      {
        key: createId(),
        title,
        variant,
        description,
        autoDismiss,
        dismissable,
        dismissDelay,
      },
    ]);
  };
  return (
    <AlertContext.Provider value={{ addAlert }}>
      <AlertGroup isToast>
        {notifications.map(({ key, variant, title, description }) => (
          <Alert
            key={key}
            isLiveRegion
            variant={AlertVariant[variant]}
            variantLabel=""
            title={title}
            actionClose={
              <AlertActionCloseButton
                title={title}
                onClose={() => hideNotification(key)}
              />
            }
          >
            {description}
          </Alert>
        ))}
      </AlertGroup>
      {children}
    </AlertContext.Provider>
  );
};
