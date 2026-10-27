export function startPolling({ load, intervalMs, onData, onError }) {
  let stopped = false;
  let inFlight = false;

  const run = async () => {
    if (stopped || inFlight) return;
    inFlight = true;

    try {
      onData(await load());
    } catch (error) {
      if (!stopped) onError(error);
    } finally {
      inFlight = false;
    }
  };

  run();
  const intervalId = window.setInterval(run, intervalMs);

  return () => {
    stopped = true;
    window.clearInterval(intervalId);
  };
}
