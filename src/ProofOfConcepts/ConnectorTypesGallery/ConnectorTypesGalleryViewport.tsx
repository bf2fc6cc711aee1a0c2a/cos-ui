import React, { FC, useEffect } from 'react';
import {
  CellMeasurerCache,
  CellMeasurer,
  InfiniteLoader,
  createMasonryCellPositioner,
  Masonry,
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
    const { isRowLoaded, loadMoreRows, getRow, useMasonry } =
      useConnectorTypesGalleryCache();
    const [scrollableElement, setScrollableElement] = React.useState<any>();
    const cellMeasurementCache = useMasonry
      ? new CellMeasurerCache({
          fixedWidth: true,
          fixedHeight: true,
          defaultHeight: 250,
          defaultWidth: 300,
          minHeight: 250,
          minWidth: 250,
          keyMapper: (rowIndex) => rowIndex,
        })
      : new CellMeasurerCache({
          fixedWidth: true,
          defaultHeight: 180,
          keyMapper: (rowIndex) => rowIndex,
        });
    const cellPositioner = useMasonry
      ? createMasonryCellPositioner({
          cellMeasurerCache: cellMeasurementCache,
          columnCount: 3,
          columnWidth: 300,
          spacer: 10,
        })
      : undefined;
    const rowRenderer = ({ index, key, parent, style }: any) => {
      const row = getRow({ index });
      return (
        <CellMeasurer
          cache={cellMeasurementCache}
          key={key}
          parent={parent}
          rowIndex={index}
        >
          <div key={key} style={style}>
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
    };
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
                          {useMasonry ? (
                            <Masonry
                              className={
                                'pf-c-virtualized pf-c-window-scroller'
                              }
                              cellCount={total}
                              cellMeasurerCache={cellMeasurementCache}
                              cellPositioner={cellPositioner!}
                              cellRenderer={rowRenderer}
                              height={height || 0}
                              width={width}
                              autoHeight={true}
                              isScrolling={isScrolling}
                              isScrollingOptOut={true}
                              onScroll={onChildScroll}
                              scrollTop={scrollTop}
                              onCellsRendered={onRowsRendered}
                              rowHeight={cellMeasurementCache.rowHeight}
                            />
                          ) : (
                            <VirtualTableBody
                              estimatedRowSize={180}
                              height={height || 0}
                              width={width}
                              autoHeight
                              className={
                                'pf-c-virtualized pf-c-window-scroller'
                              }
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
                              innerScrollContainerComponent={'div'}
                            />
                          )}
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
