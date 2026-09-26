/**
 * Global API response formatter.
 * Ensures consistent output payloads for successful operations across all endpoints.
 */
export class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode < 400; // Automatically sets success flag based on status
    this.message = message;
    this.data = data;
  }

  /**
   * Helper static method to directly send formatted responses.
   * @param {Object} res - Express Response object.
   * @param {Number} statusCode - HTTP status code.
   * @param {any} data - Content payload.
   * @param {String} message - Custom operation description text.
   */
  static send(res, statusCode, data, message = 'Success') {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
  }
}
