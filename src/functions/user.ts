import { APIGatewayEvent, Handler } from "aws-lambda";
import { UserModel } from "../models/UserModel";
import { S3Service } from "../services/S3Services";
import { getUserIdFromEvent } from "../utils/authenticationHandlerUtil";
import { DefaultJsonResponse, formatDefaultResponse } from "../utils/formatResponseUtil";

export const me: Handler = async (event: APIGatewayEvent): Promise<DefaultJsonResponse> => {
    try {
         const { USER_TABLE, AVATAR_BUCKET } = process.env;

         if (!USER_TABLE || !AVATAR_BUCKET) {
              return formatDefaultResponse(500, 'Environments para serviço não encontradas');
            }
            
            const userId = getUserIdFromEvent(event);
            if(!userId){
             return formatDefaultResponse(400, 'Usuário não encontrado');
            }

            const user = await UserModel.get({'cognitoId': userId});
            if(user && user.avatar){
                const url = await new S3Service().getImageURL(AVATAR_BUCKET, user.avatar)
                user.avatar = url;
            }

            return formatDefaultResponse(200, undefined, user);

    } catch (e: any) {
         console.log('Error on request login: ', e);
         return formatDefaultResponse(500, 'Erro ao realizar o login: ' + e);
    }
}