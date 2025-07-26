import React, { useRef, useState, useEffect } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import './VirtualScrollFrozenTable.css';

const ROW_COUNT = 1000;
const COL_COUNT = 50;
const FROZEN_COUNT = 2;
const ROW_HEIGHT = 40;
const COL_WIDTH = 120;

// dummy data
const data = Array.from({ length: ROW_COUNT }, (_, r) =>
  Array.from({ length: COL_COUNT }, (_, c) => `R${r + 1}-C${c + 1}`)
);

export default function VirtualScrollFrozenTable() {
  const containerRef = useRef();
  const gridRef = useRef();
  const [size, setSize] = useState({ width: 800, height: 400 });
  const [scroll, setScroll] = useState({ top: 0, left: 0 });

  // handle resize
  useEffect(() => {
    const onResize = () => {
      const { clientWidth: width, clientHeight: height } = containerRef.current;
      setSize({ width, height });
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // sync scroll for frozen blocks
  const onScroll = ({ scrollLeft, scrollTop }) => {
    setScroll({ left: scrollLeft, top: scrollTop });
  };

  // main grid renders only the non‑frozen columns (with header as rowIndex 0)
  const mainCols = COL_COUNT - 2 * FROZEN_COUNT;
  const renderMainCell = ({ columnIndex, rowIndex, style }) => {
    // header row
    if (rowIndex === 0) {
      return (
        <div className="header-cell" style={style}>
          {`Col ${columnIndex + 1 + FROZEN_COUNT}`}
        </div>
      );
    }
    // data rows
    return (
      <div className="cell" style={style}>
        {data[rowIndex - 1][columnIndex + FROZEN_COUNT]}
      </div>
    );
  };

  // frozen block (left or right), also with header at rowIndex 0
  const FrozenBlock = ({ side }) => {
    const cols =
      side === 'left'
        ? [...Array(FROZEN_COUNT).keys()]
        : [...Array(FROZEN_COUNT).keys()].map(i => COL_COUNT - FROZEN_COUNT + i);

    return (
      <div
        className={`frozen-block ${side}`}
        style={{
          top: 0,
          height: size.height,
          width: FROZEN_COUNT * COL_WIDTH,
          [side]: 0,
        }}
      >
        <Grid
          columnCount={FROZEN_COUNT}
          rowCount={ROW_COUNT + 1}
          columnWidth={COL_WIDTH}
          rowHeight={ROW_HEIGHT}
          width={FROZEN_COUNT * COL_WIDTH}
          height={size.height}
          style={{ overflow: 'hidden' }}
          // sync vertical scroll
          initialScrollTop={scroll.top}
        >
          {({ columnIndex, rowIndex, style }) => {
            const col = cols[columnIndex];
            // header
            if (rowIndex === 0) {
              return (
                <div
                  className={`header-cell frozen-${side}`}
                  style={style}
                >
                  {`Col ${col + 1}`}
                </div>
              );
            }
            // data
            return (
              <div
                className={`cell frozen-${side}`}
                style={style}
              >
                {data[rowIndex - 1][col]}
              </div>
            );
          }}
        </Grid>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="table-container"
      style={{ position: 'relative' }}
    >
      {/* main scrollable area */}
      <div
        className="main-grid"
        style={{
          position: 'sticky',
          top: 0,
          left: FROZEN_COUNT * COL_WIDTH,
          width: size.width - 2 * FROZEN_COUNT * COL_WIDTH,
          height: size.height,
        }}
      >
        <Grid
          ref={gridRef}
          columnCount={mainCols}
          rowCount={ROW_COUNT + 1}
          columnWidth={COL_WIDTH}
          rowHeight={ROW_HEIGHT}
          width={size.width - 2 * FROZEN_COUNT * COL_WIDTH}
          height={size.height}
          onScroll={onScroll}
          overscanRowCount={5}
          overscanColumnCount={3}
        >
          {renderMainCell}
        </Grid>
      </div>

      {/* left & right frozen columns */}
      <FrozenBlock side="left" />
      <FrozenBlock side="right" />
    </div>
  );
}
