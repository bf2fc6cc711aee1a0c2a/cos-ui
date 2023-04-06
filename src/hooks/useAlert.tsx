import React, { useContext } from 'react';

/**
 * The AlertVariant corresponds to the Patternfly AlertVariant but is redeclared here to avoid a hard dependency.
 */
export enum AlertVariant {
  success = 'success',
  danger = 'danger',
  warning = 'warning',
  info = 'info',
  default = 'default',
}

export type AlertProps = {
  /**
   * Unique key
   */
  id?: string;
  /**
   * Flag to show/hide notification close button.
   */
  dismissable?: boolean;
  /**
   * Alert variant
   */
  variant: AlertVariant;
  /**
   * Alert title
   */
  title: string;
  /**
   * Alert description
   */
  description?: string | React.ReactElement;
};

/**
 * The Alert interface allows alerts to be added to the notification system
 */
export type Alert = {
  addAlert: ({
    id,
    title,
    variant,
    description,
    dismissable,
  }: AlertProps) => void;
};

/**
 * The AlertContext allows access to the Alert context
 */

export const AlertContext: React.Context<Alert | undefined> =
  React.createContext<Alert | undefined>(undefined);

/**
 * useAlert is a custom hook that is a shorthand for useContext(AlertContext)
 */
export const useAlert = (): Alert => {
  const answer = useContext(AlertContext);
  if (answer === undefined) {
    throw new Error('must be used inside an AlertContext provider');
  }
  return answer;
};
