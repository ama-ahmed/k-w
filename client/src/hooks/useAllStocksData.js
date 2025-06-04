import { useState, useEffect, useCallback, useRef } from 'react';

const useAllStocksData = () => {
  const [stocksData, setStocksData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const workerRef = useRef(null);
  const formatterWorkerRef = useRef(null);

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
    formatterWorkerRef.current = new Worker(new URL('../workers/dataFormatter.js', import.meta.url));
    
    workerRef.current.onmessage = (e) => {
      const { success, data, error } = e.data;
      if (success) {
        formatterWorkerRef.current.postMessage({
          stocksData: data,
        });
      } else {
        setError(`Failed to parse data: ${error}`);
      }
    };
    
    formatterWorkerRef.current.onmessage = (e) => {
      const { success, data, error } = e.data;
      if (success) {
        setStocksData(data);
      } else {
        setError(`Failed to format data: ${error}`);
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
      if (formatterWorkerRef.current) {
        formatterWorkerRef.current.terminate();
      }
    };
  }, [connect]);

  return {
    stocksData,
    isConnected,
    error,
    connect
  };
};

export default useAllStocksData;