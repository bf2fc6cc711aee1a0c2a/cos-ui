import React, { FC, ReactElement, useEffect } from 'react';
import { Dimensions, useDimensionsEffect } from 'react-viewport-utils';
import {
  CellMeasurerCache,
  CellMeasurer,
  InfiniteLoader,
} from 'react-virtualized';

import {
  AutoSizer,
  VirtualTableBody,
  WindowScroller,
} from '@patternfly/react-virtualized-extension';

import { useConnectorSelectionListCache } from './ConnectorSelectionListCache';
import './ConnectorSelectionListViewport.css';
import { FeaturedConnectorType } from './typeExtensions';

export type ConnectorSelectionListViewportProps = {
  id: string;
  total: number;
  rowHeight: number;
  renderConnectorType: (props: {
    connector: FeaturedConnectorType;
    key: string;
    style: any;
  }) => ReactElement;
  renderConnectorTypeLoading: (props: any) => ReactElement;
  renderInnerScrollContainer: (props: any) => ReactElement;
  onAdjustViewportHeight: (
    dimensions: Dimensions,
    viewportEl: HTMLElement
  ) => void;
};
export const ConnectorSelectionListViewport: FC<
  ConnectorSelectionListViewportProps
> = ({
  id,
  renderConnectorType,
  renderConnectorTypeLoading,
  renderInnerScrollContainer,
  rowHeight,
  total,
  onAdjustViewportHeight,
}) => {
  const { isRowLoaded, loadMoreRows, getRow, getRowById } =
    useConnectorSelectionListCache();
  const [scrollableElement, setScrollableElement] = React.useState<any>();
  const cellMeasurementCache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: rowHeight,
    keyMapper: (rowIndex) => rowIndex,
  });
  const rowRenderer = ({ index, key, parent, style }: any) => {
    const row = getRow({ index });
    return (
      <CellMeasurer
        cache={cellMeasurementCache}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        {row && typeof row !== 'boolean'
          ? renderConnectorType({
              connector: row as FeaturedConnectorType,
              key,
              style,
            })
          : renderConnectorTypeLoading({ key, style })}
      </CellMeasurer>
    );
  };
  useDimensionsEffect((dimensions) => {
    const scrollableElement = document.getElementById(id);
    if (scrollableElement) {
      onAdjustViewportHeight(dimensions, scrollableElement!);
    }
  });
  useEffect(() => {
    const scrollableElement = document.getElementById(id);
    setScrollableElement(scrollableElement);
  }, [id]);
  return (
    <>
      <div
        id={id}
        className={
          'pf-c-scrollablegrid connector-selection-list__viewport-container'
        }
      >
        <div className={'connector-selection-list__viewport-container-inner'}>
          <InfiniteLoader
            isRowLoaded={isRowLoaded}
            loadMoreRows={loadMoreRows}
            rowCount={total}
          >
            {({ onRowsRendered, registerChild }) => (
              <WindowScroller
                scrollElement={scrollableElement}
                registerChild={registerChild}
              >
                {({ height, isScrolling, onChildScroll, scrollTop }: any) => (
                  <AutoSizer disableHeight>
                    {({ width }: any) => (
                      <VirtualTableBody
                        estimatedRowSize={rowHeight}
                        height={height || 0}
                        width={width}
                        autoHeight
                        className={'pf-c-virtualized pf-c-window-scroller'}
                        deferredMeasurementCache={cellMeasurementCache}
                        isScrolling={isScrolling}
                        isScrollingOptOut={true}
                        onScroll={onChildScroll}
                        scrollTop={scrollTop}
                        overscanRowCount={2}
                        columnCount={1}
                        rowHeight={cellMeasurementCache.rowHeight}
                        rowCount={total}
                        onRowsRendered={onRowsRendered}
                        rowRenderer={rowRenderer}
                        rows={[]}
                        scrollContainerComponent={'div'}
                        innerScrollContainerComponent={(props) =>
                          renderInnerScrollContainer({
                            ...props,
                            id: `${id}-container`,
                            getRowById,
                          })
                        }
                      />
                    )}
                  </AutoSizer>
                )}
              </WindowScroller>
            )}
          </InfiniteLoader>
        </div>
      </div>
    </>
  );
};
