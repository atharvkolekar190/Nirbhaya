function unavailable(response) {
  response.status(503).json({
    success: false,
    error: {
      code: "DATABASE_UNAVAILABLE",
      message: "MongoDB is not connected.",
    },
  });
}

export function createContactController({ model, isDatabaseConnected }) {
  return {
    list: async (request, response, next) => {
      if (!isDatabaseConnected()) return unavailable(response);

      try {
        const contacts = await model.find().sort({ priority: 1, createdAt: -1 }).lean();
        response.json({ success: true, data: contacts });
      } catch (error) {
        next(error);
      }
    },
    create: async (request, response, next) => {
      if (!isDatabaseConnected()) return unavailable(response);

      try {
        const contact = await model.create(request.body);
        response.status(201).json({ success: true, data: contact });
      } catch (error) {
        next(error);
      }
    },
    update: async (request, response, next) => {
      if (!isDatabaseConnected()) return unavailable(response);

      try {
        const contact = await model.findByIdAndUpdate(
          request.params.id,
          request.body,
          { new: true, runValidators: true },
        ).lean();

        if (!contact) {
          return response.status(404).json({
            success: false,
            error: { code: "CONTACT_NOT_FOUND", message: "Emergency contact was not found." },
          });
        }

        return response.json({ success: true, data: contact });
      } catch (error) {
        return next(error);
      }
    },
    remove: async (request, response, next) => {
      if (!isDatabaseConnected()) return unavailable(response);

      try {
        const contact = await model.findByIdAndDelete(request.params.id).lean();
        if (!contact) {
          return response.status(404).json({
            success: false,
            error: { code: "CONTACT_NOT_FOUND", message: "Emergency contact was not found." },
          });
        }

        return response.json({ success: true, data: contact });
      } catch (error) {
        return next(error);
      }
    },
  };
}
