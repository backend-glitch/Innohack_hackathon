export function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

export function sendNotFound(res) {
  return sendJson(res, 404, {
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found." }
  });
}

export function sendValidationError(res, message, code = "INVALID_REQUEST") {
  return sendJson(res, 400, {
    success: false,
    error: { code, message }
  });
}
