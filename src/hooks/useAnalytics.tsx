import React, { createContext, FunctionComponent, useContext } from 'react';

type AnalyticsContextType = {
  onActivity?: (eventName: string, properties?: unknown) => void;
};
const AnalyticsContext = createContext<AnalyticsContextType>({});

export const AnalyticsProvider: FunctionComponent<AnalyticsContextType> = ({
  children,
  onActivity,
}) => (
  <AnalyticsContext.Provider value={{ onActivity }}>
    {children}
  </AnalyticsContext.Provider>
);

export const useAnalytics: () => {
  onActivity: (eventName: string, properties?: unknown) => void;
} = () => {
  const context = useContext(AnalyticsContext);
  if (!context || !context.onActivity) {
    return {
      onActivity: (eventName: string, properties?: unknown) => {
        console.debug
          ? console.debug(
              'user activity, name: ',
              eventName,
              properties ? ` properties:  ${JSON.stringify(properties)}` : ''
            )
          : false;
      },
    };
  }
  return {
    onActivity: context!.onActivity!,
  };
};
