import { NextFunction, Request, Response } from 'express';

import { BaseException } from '../../application/model-layer/core/exceptions/base-exception';
import { ErrorHandler } from '../interfaces/error-handler';
import { Logger } from '../../application/services/logger';
import { Middleware } from '../base/middleware';

export class LogErrorService extends Middleware implements ErrorHandler {
  public handleError(error: any, request: Request, response: Response, _: NextFunction): void {
    const errorPath = `${request.method} -- ${request.url}`;
    Logger.error('Error in middleware occurred!');
    Logger.error(errorPath);
    Logger.error(`Params:`, request.params);
    Logger.error(`Body:`, request.body);
    Logger.error(`Header:`, request.headers);
    Logger.error('Error:', error);
    const expectedSize = error.expected;
    const received = error.received;
    Logger.error(`Expected size of request data: ${expectedSize} - Received content length: ${received}`);
    if (error instanceof BaseException) {
      this.sendResponse(false, error.title, response, 500);
    } else {
      this.sendResponse(false, `Something went wrong: ${errorPath}`, response, 500);
    }
    return;
  }
}
