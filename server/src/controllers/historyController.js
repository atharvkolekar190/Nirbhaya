function unavailable(response) {
  response.status(503).json({
    success: false,
    error: {
      code: "DATABASE_UNAVAILABLE",
      message: "MongoDB is not connected.",
    },
  });
}

export function createHistoryController({ model, isDatabaseConnected }) {
  return {
    create: async (request, response, next) => {
      if (!isDatabaseConnected()) return unavailable(response);

      try {
        const event = await model.create({
          ...request.body,
          source: "application",
          occurredAt: request.body.occurredAt || new Date(),
        });
        return response.status(201).json({ success: true, data: event });
      } catch (error) {
        if (error?.code === 11000) {
          const existing = await model.findOne({
            deduplicationKey: request.body.deduplicationKey,
          }).lean();
          return response.json({ success: true, data: existing, deduplicated: true });
        }
        return next(error);
      }
    },
    list: async (request, response, next) => {
      if (!isDatabaseConnected()) return unavailable(response);

      try {
        const events = await model.find().sort({ occurredAt: -1 }).limit(100).lean();
        response.json({
          success: true,
          data: events.map((event) => ({
            id: event._id,
            type: event.type,
            status: event.status,
            description: event.description,
            timestamp: event.occurredAt,
            location: event.location,
            source: event.source,
          })),
        });
      } catch (error) {
        next(error);
      }
    },
  };
}
