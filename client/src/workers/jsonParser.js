self.onmessage = function(e) {
  const { data } = e.data;
  
  
  try {
    const parsedData = JSON.parse(data);
    self.postMessage({
      success: true,
      data: parsedData
    });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message
    });
  }
};