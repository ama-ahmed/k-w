import { useState, useEffect, useCallback, useRef } from 'react';

const useStockData = (id = null) => {
  const [stocksData, setStocksData] = useState([]);
  const [currentStock, setCurrentStock] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const workerRef = useRef(null);
  const stockFinderWorkerRef = useRef(null);
  const currentStockRef = useRef(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket('ws://localhost:8080');
      
      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };
      
      ws.onmessage = (event) => {
        if (workerRef.current) {
          
          workerRef.current.postMessage({
            data: event.data
          });
        }
      };
      
      ws.onerror = (err) => {
        setError(`WebSocket error: ${err.message || 'Unknown error'}`);
        setIsConnected(false);
      };
      
      ws.onclose = () => {
        setIsConnected(false);
      };
      

      
      return ws;
    } catch (err) {
      setError(`Failed to connect: ${err.message}`);
      return null;
    }
  }, []);



  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/jsonParser.js', import.meta.url));
    stockFinderWorkerRef.current = new Worker(new URL('../workers/stockFinder.js', import.meta.url));
    
    workerRef.current.onmessage = (e) => {
      const { success, data, error } = e.data;
      if (success) {
        setStocksData(data);
        
        if (id && stockFinderWorkerRef.current) {
          stockFinderWorkerRef.current.postMessage({
            currentStock: currentStockRef.current,
            stocksData: data,
            id: id
          });
        }
      } else {
        setError(`Failed to parse data: ${error}`);
      }
    };
    
    stockFinderWorkerRef.current.onmessage = (e) => {
      const { stock, hasChanged } = e.data;
      if (hasChanged) {
        currentStockRef.current = stock;
        setCurrentStock(stock);
      }
    };
    
    const ws = connect();
    
    return () => {
      if (ws) {
        ws.close();
      }
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      if (stockFinderWorkerRef.current) {
        stockFinderWorkerRef.current.terminate();
      }
    };
  }, [connect, id]);

  return {
    stocksData,
    currentStock,
    isConnected,
    error,
    connect
  };
};

export default useStockData;