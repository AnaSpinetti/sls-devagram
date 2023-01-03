import {  Handler } from "aws-lambda";
import { getUserIdFromEvent } from "../utils/authenticationHandlerUtil";
import { DefaultJsonResponse, formatDefaultResponse } from "../utils/formatResponseUtil";
import { validateEnvs } from "../utils/environmentsUtils";
import { UserModel } from "../models/UserModel";
import { PostModel } from "../models/PostModel";
import { S3Service } from "../services/S3Services";
import { FeedLastKeyRequest } from "../types/feed/FeedLastKeyRequest";
import { DefaultListPaginatedResponse } from "../types/DefaultListPaginatedResponse";

export const findByUserId: Handler = async (event: any): Promise<DefaultJsonResponse> => {
    try {
        const { POST_BUCKET, error } = validateEnvs(['USER_TABLE', 'POST_BUCKET', 'POST_TABLE']);

        if (error) {
            return formatDefaultResponse(500, error);
        }
        
        const {userId} = event.pathParameters || {userId: getUserIdFromEvent(event)};     
        if (!userId) {
            return formatDefaultResponse(400, 'Usuário não encontrado');
        }
        
        const user = await UserModel.get({cognitoId: userId});
        if (!user) {
            return formatDefaultResponse(400, 'Usuário não encontrado');
        }

        const lastKey = (event.queryStringParameters || '') as FeedLastKeyRequest;
        
        const query = PostModel.query({'userId':userId}).sort("descending");

        if (lastKey && lastKey.date && lastKey.id && lastKey.userId) {
            query.startAt(lastKey);
        }

        const result = await query.limit(20).exec();

        let response = {
            lastkey: null,
            count: 0,
            data: []
       };

       if (result) {
        response.count = result.count;
        response.lastkey = result.lastKey;
        for (const document of result) {
             if (document && document.image) {
                  const url = await new S3Service().getImageURL(POST_BUCKET, document.image);
                  document.image = url;
             }
        }

        response.data = result;
   }

        return formatDefaultResponse(200, undefined, response);

    } catch (e: any) {
        console.log('Error on get user feed: ', e);
        return formatDefaultResponse(500, 'Erro ao exibir feed do usuário: ' + e);
    }
}

export const feedHome: Handler = async (event: any): Promise<DefaultJsonResponse> => {
    try {
        const { POST_BUCKET, error } = validateEnvs(['USER_TABLE', 'POST_BUCKET', 'POST_TABLE']);

        if (error) {
            return formatDefaultResponse(500, error);
        }
        
        const userId = getUserIdFromEvent(event);     
        if (!userId) {
            return formatDefaultResponse(400, 'Usuário não encontrado');
        }
        
        const user = await UserModel.get({cognitoId: userId});
        if (!user) {
            return formatDefaultResponse(400, 'Usuário não encontrado');
        }

        const {lastKey} = event.queryStringParameters || null;

        const userToSearch = user.following;
        userToSearch.push(userId);
        
        const query = PostModel.scan('userId').in(userToSearch);

        if (lastKey) {
            query.startAt({id: lastKey});
        }

        const result = await query.limit(20).exec();

        let response = {} as DefaultListPaginatedResponse;

       if (result) {
        response.count = result.count;
        response.lastKey = result.lastKey;
        for (const document of result) {
             if (document && document.image) {
                  const url = await new S3Service().getImageURL(POST_BUCKET, document.image);
                  document.image = url;
             }
        }

        response.data = result;
   }

        return formatDefaultResponse(200, undefined, response);

    } catch (e: any) {
        console.log('Error on show home feed: ', e);
        return formatDefaultResponse(500, 'Erro ao exibir feed: ' + e);
    }
}