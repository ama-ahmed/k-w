import React, { memo } from 'react';
import StockCell from './StockCell';

const StockRow = memo(({ virtualRow, stock, row, index }) => {
  return (
    <tr
      key={stock.id}
      style={{
        height: `${virtualRow.size}px`,
        transform: `translateY(${
          virtualRow.start - index * virtualRow.size
        }px)`,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <StockCell key={cell.id} cell={cell} />
      ))}
    </tr>
  );
}, (prevProps, nextProps) => {
  const prevStock = prevProps.stock;
  const nextStock = nextProps.stock;
  
  return (
    prevStock.id === nextStock.id &&
    prevStock.last === nextStock.last &&
    prevStock.high === nextStock.high &&
    prevStock.low === nextStock.low &&
    prevStock.change === nextStock.change &&
    prevStock.volume === nextStock.volume &&
    prevStock.price === nextStock.price
  );
});

export default StockRow;