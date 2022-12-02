import React, { FC, useEffect } from 'react';
import { useDimensionsEffect } from 'react-viewport-utils';
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
import './ConnectorTypesGalleryViewport.css';

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
      defaultHeight: 119,
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
    useDimensionsEffect((dimensions) => {
      const scrollableElement = document.getElementById(id);
      const top = scrollableElement!.offsetTop + 20;
      scrollableElement!.style.height = `${dimensions.height - top}px`;
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
            'pf-c-scrollablegrid connector-types-gallery__viewport-container'
          }
        >
          <div className={'connector-types-gallery__viewport-container-inner'}>
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
                            estimatedRowSize={119}
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
