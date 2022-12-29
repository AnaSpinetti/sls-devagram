import {  Handler } from "aws-lambda";
import { UserModel } from "../models/UserModel";
import { S3Service } from "../services/S3Services";
import { getUserIdFromEvent } from "../utils/authenticationHandlerUtil";
import { DefaultJsonResponse, formatDefaultResponse } from "../utils/formatResponseUtil";
import { validateEnvs } from "../utils/environmentsUtils";

export const toggle: Handler = async (event: any): Promise<DefaultJsonResponse> => {
    try {
        const { error } = validateEnvs(['USER_TABLE']);

        if (error) {
            return formatDefaultResponse(500, error);
        }

        const userId = getUserIdFromEvent(event);
        if (!userId) {
            return formatDefaultResponse(400, 'Usuário não encontrado');
        }

        const loggedUser = await UserModel.get({ 'cognitoId': userId });

        const {followId} =  event.pathParameters;
        if (!followId) {
            return formatDefaultResponse(400, 'Usuário a ser seguido não encontrado');
        }
        
        if(loggedUser === followId){
            return formatDefaultResponse(400, 'Ação inválida');
        }
        console.log('logged' + loggedUser)
        console.log('logged' + followId)

        const followUser = await UserModel.get({ 'cognitoId': followId });
        if (!followUser) {
            return formatDefaultResponse(400, 'Usuário a ser seguido não encontrado');
        }

        const hasFollow = loggedUser.following.findIndex(e => e === followId);
        if(hasFollow != -1){
            loggedUser.following.splice(hasFollow, 1);
            followUser.followers = followUser.followers-1;
            await UserModel.update(loggedUser);
            await UserModel.update(followUser);
            return formatDefaultResponse(200, 'Usuário deixado de seguir com sucesso');
        }else{
            loggedUser.following.push(followId);
            followUser.followers  = followUser.followers+1;
            await UserModel.update(loggedUser);
            await UserModel.update(followUser);
            return formatDefaultResponse(200, 'Usuário seguido com sucesso');
        }

    } catch (e: any) {
        console.log('Error on follow/unfollow user: ', e);
        return formatDefaultResponse(500, 'Erro ao seguir/deixar de seguir o usuário: ' + e);
    }
}