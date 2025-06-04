self.onmessage = function(e) {
  const { stocksData } = e.data;
  
  try {
    const formattedData = stocksData.map(stock => {
      const formattedStock = { ...stock };
      
      const safeFormat = (value, decimals = 2) => {
        if (value === null || value === undefined) return '0.00';
        
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        

        if (isNaN(numValue)) return '0.00';
        
        return numValue.toFixed(decimals);
      };
      
      const safeCurrencyFormat = (value) => {
        const formatted = safeFormat(value);
        return `$${formatted}`;
      };
      
      const safeVolumeFormat = (value) => {
        if (value === null || value === undefined) return '0';
        
        const numValue = typeof value === 'string' ? parseInt(value) : value;
        
        if (isNaN(numValue)) return '0';
        
        return numValue.toLocaleString();
      };
      
      const safeChangeFormat = (value) => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        
        
        if (isNaN(numValue) || value === null) {
          return {
            formatted: '0.00',
            changeClass: 'neutral',
            changeSign: ''
          };
        }
        
        const changeClass = numValue >= 0 ? 'positive' : 'negative';
        const changeSign = numValue >= 0 ? '+' : '';
        const formatted = numValue.toFixed(2);
        
        return {
          formatted,
          changeClass,
          changeSign,
          value: numValue
        };
      };
      
 
      formattedStock.lastFormatted = safeCurrencyFormat(stock.last);
      formattedStock.highFormatted = safeCurrencyFormat(stock.high);
      formattedStock.lowFormatted = safeCurrencyFormat(stock.low);
      formattedStock.priceFormatted = safeCurrencyFormat(stock.price);
      formattedStock.volumeFormatted = safeVolumeFormat(stock.volume);
      formattedStock.changeFormatted = safeChangeFormat(stock.change);
      
      
      formattedStock.last = typeof stock.last === 'string' ? parseFloat(stock.last) || 0 : stock.last || 0;
      formattedStock.high = typeof stock.high === 'string' ? parseFloat(stock.high) || 0 : stock.high || 0;
      formattedStock.low = typeof stock.low === 'string' ? parseFloat(stock.low) || 0 : stock.low || 0;
      formattedStock.price = typeof stock.price === 'string' ? parseFloat(stock.price) || 0 : stock.price || 0;
      formattedStock.volume = typeof stock.volume === 'string' ? parseInt(stock.volume) || 0 : stock.volume || 0;
      formattedStock.change = typeof stock.change === 'string' ? parseFloat(stock.change) || 0 : stock.change || 0;
      
      return formattedStock;
    });
    
    self.postMessage({
      success: true,
      data: formattedData,
    });
    
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message,
    });
  }
};