export function createDeviceController(deviceDataService) {
  return {
    getLatest: async (request, response, next) => {
      try {
        const data = await deviceDataService.getLatest();
        response.json({ success: true, data });
      } catch (error) {
        next(error);
      }
    },
    getHistory: async (request, response, next) => {
      try {
        const data = await deviceDataService.getHistory(request.query.limit);
        response.json({ success: true, data });
      } catch (error) {
        next(error);
      }
    },
  };
}
