import { APIGatewayEvent, Handler } from "aws-lambda";
import { UserModel } from "../models/UserModel";
import { S3Service } from "../services/S3Services";
import { getUserIdFromEvent } from "../utils/authenticationHandlerUtil";
import { DefaultJsonResponse, formatDefaultResponse } from "../utils/formatResponseUtil";
import { FileData } from 'aws-multipart-parser/dist/models';
import {parse} from 'aws-multipart-parser';
import { imageExtensionAllowed } from "../constants/Regexes";

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
                user.password = null;
            }

            return formatDefaultResponse(200, undefined, user);

    } catch (e: any) {
         console.log('Error on request login: ', e);
         return formatDefaultResponse(500, 'Erro ao realizar o login: ' + e);
    }
}

export const update: Handler = async (event: APIGatewayEvent): Promise<DefaultJsonResponse> => {
    try {
         const { USER_TABLE, AVATAR_BUCKET } = process.env;

         if (!USER_TABLE || !AVATAR_BUCKET) {
            return formatDefaultResponse(500, 'Environments para serviço não encontradas');
        }
            
        if(!event.body){
            return formatDefaultResponse(500, 'Parâmetros de entrada inválidos');
        }
            
        const userId = getUserIdFromEvent(event);
        if(!userId){
            return formatDefaultResponse(400, 'Usuário não encontrado');
        }

        const user = await UserModel.get({'cognitoId': userId});
        
        const formData = parse(event, true);
        const file = formData.file as FileData;
        const name = formData.name as string;

        if (name && name.trim().length < 2) {
            return formatDefaultResponse(400, 'Nome inválido');
       }else if(name){
        user.name = name;
       }

       if(file && !imageExtensionAllowed.exec(file.filename)){
            return formatDefaultResponse(400, 'Extensão inválida');
       }else if(file){
        const newKey = await new S3Service().saveImage(AVATAR_BUCKET, 'avatar', file)
        user.avatar = newKey;
       }

       await UserModel.update(user)
        return formatDefaultResponse(200, 'Usuário alterado com sucesso');

    } catch (e: any) {
         console.log('Error on update user: ', e);
         return formatDefaultResponse(500, 'Erro ao atualizar o usuário: ' + e);
    }
}