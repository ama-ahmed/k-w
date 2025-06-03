// Worker to find a specific stock by ID from stocks data
self.onmessage = function(e) {
  const { stocksData, id, currentStock } = e.data;
  
  try {
    const stockId = parseInt(id, 10);
    const stock = stocksData.find(stock => stock.id === stockId);
    
    if (!stock) {
      self.postMessage({
        stock: null,
        hasChanged: currentStock !== null
      });
      return;
    }
    
    let hasChanged = false;
    if (!currentStock) {
      hasChanged = true;
    } else {
      if(currentStock.price !== stock.price ||
        currentStock.change !== stock.change ||
        currentStock.changePercent !== stock.changePercent ||
        currentStock.volume !== stock.volume ||
        currentStock.high !== stock.high ||
        currentStock.low !== stock.low ||
        currentStock.last !== stock.last)
        {
          hasChanged = true;
        }
    }
    
    self.postMessage({
      stock: stock,
      hasChanged: hasChanged
    });
  } catch (error) {
    self.postMessage({
      stock: null,
      hasChanged: false,
      error: error.message
    });
  }
};