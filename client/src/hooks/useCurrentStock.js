import { useState, useEffect, useCallback, useRef } from 'react';

const useCurrentStock = (id) => {
  const [currentStock, setCurrentStock] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const workerRef = useRef(null);
  const stockFinderWorkerRef = useRef(null);
  const formatterWorkerRef = useRef(null);
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
    if (!id) return;

    workerRef.current = new Worker(new URL('../workers/jsonParser.js', import.meta.url));
    stockFinderWorkerRef.current = new Worker(new URL('../workers/stockFinder.js', import.meta.url));
    formatterWorkerRef.current = new Worker(new URL('../workers/dataFormatter.js', import.meta.url));
    
    workerRef.current.onmessage = (e) => {
      const { success, data, error } = e.data;
      if (success && stockFinderWorkerRef.current) {
        stockFinderWorkerRef.current.postMessage({
          currentStock: currentStockRef.current,
          stocksData: data,
          id: id
        });
      } else if (!success) {
        setError(`Failed to parse data: ${error}`);
      }
    };
    
    stockFinderWorkerRef.current.onmessage = (e) => {
      const { stock, hasChanged } = e.data;
      if (hasChanged) {
        formatterWorkerRef.current.postMessage({
          stocksData: [stock],
        });
      }
    };
    
    formatterWorkerRef.current.onmessage = (e) => {
      const { success, data, error } = e.data;
      if (success && data.length > 0) {
        const formattedStock = data[0];
        currentStockRef.current = formattedStock;
        setCurrentStock(formattedStock);
      } else if (!success) {
        setError(`Failed to format stock data: ${error}`);
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
      if (formatterWorkerRef.current) {
        formatterWorkerRef.current.terminate();
      }
    };
  }, [connect, id]);

  return {
    currentStock,
    isConnected,
    error,
    connect
  };
};

export default useCurrentStock;