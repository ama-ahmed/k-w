import React, { memo } from 'react';
import { flexRender } from '@tanstack/react-table';

const StockCell = memo(({ cell }) => {  
  return (
    <td key={cell.id}>
      {flexRender(
        cell.column.columnDef.cell,
        cell.getContext(),
      )}
    </td>
  );
}, (prevProps, nextProps) => {
  const prevValue = prevProps.cell.getValue();
  const nextValue = nextProps.cell.getValue();
  
  return prevValue === nextValue;
});


export default StockCell;