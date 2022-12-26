import { APIGatewayEvent, Handler } from "aws-lambda";
import { DefaultJsonResponse, formatDefaultResponse } from "../utils/formatResponseUtil";
import { LoginRequest } from '../types/login/LoginRequest';
import { CognitoServices } from "../../services/CognitoServices";

export const handler: Handler = async (event: APIGatewayEvent): Promise<DefaultJsonResponse> => {
    try {
         const { USER_POOL_ID, USER_POOL_CLIENT_ID } = process.env;

         if (!USER_POOL_ID || !USER_POOL_CLIENT_ID) {
              return formatDefaultResponse(500, 'Cognito Environments não encontradas');
         }
         if (!event.body) {
              return formatDefaultResponse(400, 'Parâmetros de entrada inválidos');
         }

         const request = JSON.parse(event.body) as LoginRequest;
         const { login, password } = request;
         
         if (!login || !password) {
              return formatDefaultResponse(400, 'Parâmetros de entrada inválidos');
         }
    
         const result = await new CognitoServices(USER_POOL_ID, USER_POOL_CLIENT_ID).login(login, password);

         return formatDefaultResponse(200, undefined, result);

    } catch (e: any) {
         console.log('Error on request login: ', e);
         return formatDefaultResponse(500, 'Erro ao realizar o login: ' + e);
    }
}