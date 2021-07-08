import { ToolbarChip } from '@patternfly/react-core';

export const stringToChip = (
  value: string,
  t: (key: string) => string
): ToolbarChip => ({ key: value, node: t(value) });
