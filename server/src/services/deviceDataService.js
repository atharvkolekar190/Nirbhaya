export function createDeviceDataService(thingSpeakService) {
  return {
    getLatest: () => thingSpeakService.getLatestData(),
    getHistory: (limit) => thingSpeakService.getHistory(limit),
  };
}
