import { Request, Response, NextFunction } from "express";

const responseFormatter = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;

  res.json = function (data: any) {
    if (res.headersSent) {
      return originalJson.apply(res, arguments as any);
    }

    const statusCode = res.statusCode;
    let finalMessage = "Success"; // Default message
    let finalData: any = null; // What will go into the 'data' field of the final response
    let formattedResponse: any = {}; // Declare formattedResponse here

    if (typeof data === 'object' && data !== null) {
      // If a message is explicitly provided in the passed data, use it
      if (data.message) {
        finalMessage = data.message;
      }

      // Initialize formattedResponsePayload with fields that should always be present if they exist in the incoming data
      const paginationFields: Record<string, any> = {};
      if (typeof data.total === 'number') {
        paginationFields.total = data.total;
      }
      if (typeof data.limit === 'number') {
        paginationFields.limit = data.limit;
      }
      if (typeof data.totalPages === 'number') {
        paginationFields.totalPages = data.totalPages;
      }
      if (typeof data.currentPage === 'number') {
        paginationFields.currentPage = data.currentPage;
      }

      // If 'data' property exists in the object passed to res.json, use its value as the final payload
      if ('data' in data) {
        finalData = data.data;
      } else {
        // Otherwise, the rest of the properties (excluding message/statusCode) are the final payload
        const { message, statusCode: dataStatusCode, ...restOfData } = data;
        finalData = restOfData;
        // If restOfData is empty, set finalData to null (e.g., if only message/statusCode were present)
        if (Object.keys(restOfData).length === 0) {
          finalData = null;
        }
      }

      // Combine base formatted response with pagination fields
      formattedResponse = {
        statusCode: statusCode,
        message: finalMessage,
        data: finalData,
        ...paginationFields,
      };

      return originalJson.call(this, formattedResponse);
    } else {
      // If the data passed to res.json is not an object (e.g., null, string, number), use it directly as finalPayload
      finalData = data;

      formattedResponse = {
        statusCode: statusCode,
        message: finalMessage,
        data: finalData,
      };

      return originalJson.call(this, formattedResponse);
    }
  };

  next();
};

export default responseFormatter; 