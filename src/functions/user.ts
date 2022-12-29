import { APIGatewayEvent, Handler } from "aws-lambda";
import { UserModel } from "../models/UserModel";
import { S3Service } from "../services/S3Services";
import { getUserIdFromEvent } from "../utils/authenticationHandlerUtil";
import { DefaultJsonResponse, formatDefaultResponse } from "../utils/formatResponseUtil";
import { FileData } from 'aws-multipart-parser/dist/models';
import { parse } from 'aws-multipart-parser';
import { imageExtensionAllowed } from "../constants/Regexes";
import { validateEnvs } from "../utils/environmentsUtils";
import { DefaultListPaginatedResponse } from "../types/DefaultListPaginatedResponse";

export const me: Handler = async (event: APIGatewayEvent): Promise<DefaultJsonResponse> => {
    try {
        const { AVATAR_BUCKET, error } = validateEnvs(['USER_TABLE', 'AVATAR_BUCKET']);

        if (error) {
            return formatDefaultResponse(500, error);
        }


        const userId = getUserIdFromEvent(event);
        if (!userId) {
            return formatDefaultResponse(400, 'Usuário não encontrado');
        }

        const user = await UserModel.get({ 'cognitoId': userId });
        if (user && user.avatar) {
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
        const { AVATAR_BUCKET, error } = validateEnvs(['USER_TABLE', 'AVATAR_BUCKET']);

        if (error) {
            return formatDefaultResponse(500, error);
        }

        if (!event.body) {
            return formatDefaultResponse(500, 'Parâmetros de entrada inválidos');
        }

        const userId = getUserIdFromEvent(event);
        if (!userId) {
            return formatDefaultResponse(400, 'Usuário não encontrado');
        }

        const user = await UserModel.get({ 'cognitoId': userId });

        const formData = parse(event, true);
        const file = formData.file as FileData;
        const name = formData.name as string;

        if (name && name.trim().length < 2) {
            return formatDefaultResponse(400, 'Nome inválido');
        } else if (name) {
            user.name = name;
        }

        if (file && !imageExtensionAllowed.exec(file.filename)) {
            return formatDefaultResponse(400, 'Extensão inválida');
        } else if (file) {
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

export const getUserById: Handler = async (event: any): Promise<DefaultJsonResponse> => {
    try {
        const { AVATAR_BUCKET, error } = validateEnvs(['USER_TABLE', 'AVATAR_BUCKET']);

        if (error) {
            return formatDefaultResponse(500, error);
        }

        const {userId} = event.pathParameters;
        if (!userId) {
            return formatDefaultResponse(400, 'Usuário não encontrado');
        }

        const user = await UserModel.get({ 'cognitoId': userId });
        if (!user) {
            return formatDefaultResponse(400, 'Usuário não encontrado');
        }

        if ( user.avatar) {
            const url = await new S3Service().getImageURL(AVATAR_BUCKET, user.avatar)
            user.avatar = url;
            user.password = null;
        }

        return formatDefaultResponse(200, undefined, user);

    } catch (e: any) {
        console.log('Error on get user by id: ', e);
        return formatDefaultResponse(500, 'Erro ao buscar dados do usuário por Id: ' + e);
    }
}

export const searchUser: Handler = async (event: any): Promise<DefaultJsonResponse> => {
    try {
        const { AVATAR_BUCKET, error } = validateEnvs(['USER_TABLE', 'AVATAR_BUCKET']);

        if (error) {
            return formatDefaultResponse(500, error);
        }

        const {filter} = event.pathParameters;
        if (!filter || filter.length < 3) {
            return formatDefaultResponse(400, 'Filtro não informado');
        }

        const {lastKey} = event.queryStringParameters || '';
        
        const query = UserModel.scan().where("name").contains(filter).or().where("email").contains(filter);

        if (lastKey) {
            query.startAt({cognitoId:lastKey});
        }

        const result = await query.limit(9).exec();

        const response = {} as DefaultListPaginatedResponse;
        if(result){
            response.count = result.count;
            response.lastKey = result.lastKey;

            for(const document of result){
                if(document && document.avatar){
                    document.avatar = await new S3Service().getImageURL(AVATAR_BUCKET, document.avatar)
                }
            }

            response.data = result;
        }

        return formatDefaultResponse(200, undefined, response);

    } catch (e: any) {
        console.log('Error on search user: ', e);
        return formatDefaultResponse(500, 'Erro ao buscar usuário: ' + e);
    }
}