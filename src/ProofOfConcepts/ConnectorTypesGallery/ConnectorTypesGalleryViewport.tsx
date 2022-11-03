import React, { FC, useEffect } from 'react';
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

import { useConnectorTypesGalleryCache } from './ConnectorTypesGalleryCache';

export type ConnectorTypesGalleryViewportProps = {
  id: string;
  total: number;
  renderConnectorType: (connectorType: {
    id: string;
    labels: string[];
    name: string;
    description: string;
    version: string;
    featuredRank: number;
  }) => React.ReactElement;
  renderConnectorTypeLoading: () => React.ReactElement;
};
export const ConnectorTypesGalleryViewport: FC<ConnectorTypesGalleryViewportProps> =
  ({ id, renderConnectorType, renderConnectorTypeLoading, total }) => {
    const { isRowLoaded, loadMoreRows, getRow } =
      useConnectorTypesGalleryCache();
    const [scrollableElement, setScrollableElement] = React.useState<any>();

    const cellMeasurementCache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 180,
      keyMapper: (rowIndex) => rowIndex,
    });
    useEffect(() => {
      const scrollableElement = document.getElementById(id);
      setScrollableElement(scrollableElement);
    });
    return (
      <>
        <div
          id={id}
          className="pf-c-scrollablegrid"
          style={{
            overflowX: 'auto',
            overflowY: 'scroll',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            position: 'relative',
            height: 600,
          }}
        >
          <div style={{ padding: 15 }}>
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
                  {({
                    height,
                    isScrolling,
                    onChildScroll,
                    scrollTop,
                    registerChild,
                  }: any) => (
                    <AutoSizer disableHeight>
                      {({ width }: any) => (
                        <div ref={registerChild}>
                          <VirtualTableBody
                            estimatedRowSize={180}
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
                            rowRenderer={({
                              index,
                              key,
                              parent,
                              style,
                            }: any) => {
                              const row = getRow({ index });
                              return (
                                <CellMeasurer
                                  cache={cellMeasurementCache}
                                  key={key}
                                  parent={parent}
                                  rowIndex={index}
                                >
                                  <div style={style}>
                                    {row && typeof row !== 'boolean'
                                      ? renderConnectorType({
                                          id: row.id!,
                                          labels: row.labels!,
                                          name: row.name!,
                                          description: row.description!,
                                          version: row.version!,
                                          featuredRank: row.featured_rank,
                                        })
                                      : renderConnectorTypeLoading()}
                                  </div>
                                </CellMeasurer>
                              );
                            }}
                            rows={[]}
                            scrollContainerComponent={'div'}
                            innerScrollContainerComponent={'div'}
                          />
                        </div>
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
