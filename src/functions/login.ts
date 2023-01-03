import { APIGatewayEvent, Handler } from "aws-lambda";
import { DefaultJsonResponse, formatDefaultResponse } from "../utils/formatResponseUtil";
import { LoginRequest } from '../types/login/LoginRequest';
import { CognitoServices } from "../services/CognitoServices";
import { validateEnvs } from "../utils/environmentsUtils";
import {logger} from '../utils/loggerUtils';

export const handler: Handler = async (event: APIGatewayEvent): Promise<DefaultJsonResponse> => {
     try {
          const { USER_POOL_ID, USER_POOL_CLIENT_ID, error } = validateEnvs(['USER_POOL_ID', 'USER_POOL_CLIENT_ID']);

          if (error) {
               logger.error("login.handler - " + error)
               return formatDefaultResponse(500, error);
          }

          if (!event.body) {
               return formatDefaultResponse(400, 'Parâmetros de entrada inválidos');
          }

          const request = JSON.parse(event.body) as LoginRequest;
          const { login, password } = request;

          if (!login || !password) {
               return formatDefaultResponse(400, 'Parâmetros de entrada inválidos');
          }
          
          logger.info('login.handler - start: ', login)
          
          const result = await new CognitoServices(USER_POOL_ID, USER_POOL_CLIENT_ID).login(login, password);
          
          logger.debug('login.handler - cognito response: ', result)
          logger.info('login.handler - finish: ', login)

          return formatDefaultResponse(200, undefined, result);

     } catch (e: any) {
          logger.error('Login.Handler - Error on request login: ', e);
          return formatDefaultResponse(500, 'Erro ao realizar o login: ' + e);
     }
}