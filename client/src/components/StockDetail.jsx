import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useCurrentStock from '../hooks/useCurrentStock';
import '../styles/StockDetail.css';

const StockDetail = () => {
  const { id } = useParams();
  const { currentStock, isConnected, error } = useCurrentStock(id);
  const queryClient = useQueryClient();
  
  const { data: stockToDisplay } = useQuery({
    queryKey: ['stock', id],
    queryFn: () => currentStock,
    enabled: !!currentStock && !!id,
    initialData: () => {
      return queryClient.getQueryData(['stock', id]);
    },
  });

  useEffect(() => {
    if (currentStock) {
      queryClient.setQueryData(['stock', id], currentStock);
    }
  }, [currentStock, id, queryClient]);

  // if (!isConnected) return <div className="loading">Connecting to WebSocket server...</div>;
  // if (error) return <div className="error">Error: {error}</div>;
  if (!stockToDisplay) return <div className="loading">Loading stock data...</div>;


  const changeData = stockToDisplay.changeFormatted || {
    changeClass: stockToDisplay.change >= 0 ? 'positive' : 'negative',
    changeSign: stockToDisplay.change >= 0 ? '+' : '',
    formatted: (stockToDisplay.change || 0).toFixed(2)
  };

  return (
    <div className="stock-detail-container">
      <div className="stock-detail-header">
        <Link to="/" className="back-button">
          &larr; Back to Stocks
        </Link>
      </div>

      <div className="stock-detail-card">
        <h2>Stock #{stockToDisplay.id}</h2>
        
        <div className="stock-detail-main">
          <div className="stock-price-container">
            <div className="current-price">{stockToDisplay.priceFormatted || `$${(stockToDisplay.price || 0).toFixed(2)}`}</div>
            <div className={`price-change ${changeData.changeClass}`}>
              {changeData.changeSign}{changeData.formatted} ({changeData.changeSign}{(((stockToDisplay.change || 0) / (stockToDisplay.price || 1)) * 100).toFixed(2)}%)
            </div>
          </div>

          <div className="stock-stats">
            <div className="stat-item">
              <div className="stat-label">Last</div>
              <div className="stat-value">{stockToDisplay.lastFormatted || `$${(stockToDisplay.last || 0).toFixed(2)}`}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">High</div>
              <div className="stat-value">{stockToDisplay.highFormatted || `$${(stockToDisplay.high || 0).toFixed(2)}`}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Low</div>
              <div className="stat-value">{stockToDisplay.lowFormatted || `$${(stockToDisplay.low || 0).toFixed(2)}`}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Volume</div>
              <div className="stat-value">{stockToDisplay.volumeFormatted || (stockToDisplay.volume || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StockDetail;