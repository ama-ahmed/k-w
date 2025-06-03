import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useStockData from '../hooks/useStockData';
import '../styles/StockDetail.css';

const StockDetail = () => {
  const { id } = useParams();
  const { currentStock, isConnected, error } = useStockData(id);
  const queryClient = useQueryClient();
  
  const { data: cachedStock } = useQuery({
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
  const stockToDisplay = cachedStock || currentStock;
  if (!stockToDisplay) return <div className="loading">Loading stock data...</div>;

  const changeClass = stockToDisplay.change >= 0 ? 'positive' : 'negative';
  const changeSign = stockToDisplay.change >= 0 ? '+' : '';

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
            <div className="current-price">${stockToDisplay.price.toFixed(2)}</div>
            <div className={`price-change ${changeClass}`}>
              {changeSign}{stockToDisplay.change.toFixed(2)} ({changeSign}{((stockToDisplay.change / stockToDisplay.price) * 100).toFixed(2)}%)
            </div>
          </div>

          <div className="stock-stats">
            <div className="stat-item">
              <div className="stat-label">Last</div>
              <div className="stat-value">${stockToDisplay.last.toFixed(2)}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">High</div>
              <div className="stat-value">${stockToDisplay.high.toFixed(2)}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Low</div>
              <div className="stat-value">${stockToDisplay.low.toFixed(2)}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Volume</div>
              <div className="stat-value">{stockToDisplay.volume.toLocaleString()}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StockDetail;