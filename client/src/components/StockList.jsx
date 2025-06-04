import { Link } from 'react-router-dom';
import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import useAllStocksData from '../hooks/useAllStocksData';
import '../styles/StockList.css';
import StockRow from './StockRow';


const StockList = () => {
  const { stocksData, isConnected, error } = useAllStocksData();
  const parentRef = useRef(null);
  
  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { 
        accessorKey: 'lastFormatted', 
        header: 'Last',
        cell: info => info.getValue()
      },
      { 
        accessorKey: 'highFormatted', 
        header: 'High',
        cell: info => info.getValue()
      },
      { 
        accessorKey: 'lowFormatted', 
        header: 'Low',
        cell: info => info.getValue()
      },
      { 
        accessorKey: 'changeFormatted', 
        header: 'Change',
        cell: info => {
          const changeData = info.row.original.changeFormatted;
          return <span className={changeData.changeClass}>{changeData.changeSign}{changeData.formatted}</span>;
        }
      },
      { 
        accessorKey: 'volumeFormatted', 
        header: 'Volume',
        cell: info => info.getValue()
      },
      { 
        accessorKey: 'priceFormatted', 
        header: 'Price',
        cell: info => info.getValue()
      },
      { 
        accessorKey: 'id', 
        id: 'details',
        header: 'Details',
        cell: info => <Link to={`/stock/${info.getValue()}`} className="details-link">View</Link>
      },
    ],
    []
  );

  const table = useReactTable({
    data: stocksData || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();
  
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 53,
    overscan: 5,
  });
  
  const isLoading = !isConnected && !error;

  if (isLoading) return <div className="loading">Loading stocks data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!stocksData || stocksData.length === 0) return <div className="no-data">No stocks data available</div>;

  return (
    <div className="stock-list-container">
      <div className="stock-list-header">
        <h2>Real-time Stock Data</h2>
        <div className="stock-count">{stocksData.length} stocks</div>
      </div>

      <div className="table-container">
        <div 
          ref={parentRef}
          className="virtual-table-container"
          style={{
            height: 'calc(100vh - 350px)',
            minHeight: '400px',
            width: '100%',
            overflow: 'auto',
            position: 'relative',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
          }}
        >
          <table className="stock-table" style={{ width: '100%' }}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : header.column.columnDef.header}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {rowVirtualizer.getVirtualItems().map((virtualRow, index) => {
                const stock = stocksData[virtualRow.index];
                const row = rows[virtualRow.index];

                return (
                  <StockRow
                    key={index}
                    virtualRow={virtualRow}
                    stock={stock}
                    row={row}
                    index={index}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockList;