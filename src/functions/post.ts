import * as Uuid from 'uuid';
import * as moment from 'moment';
import { APIGatewayEvent, Handler } from "aws-lambda";
import { UserModel } from "../models/UserModel";
import { S3Service } from "../services/S3Services";
import { getUserIdFromEvent } from "../utils/authenticationHandlerUtil";
import { DefaultJsonResponse, formatDefaultResponse } from "../utils/formatResponseUtil";
import { FileData } from 'aws-multipart-parser/dist/models';
import { parse } from 'aws-multipart-parser';
import { imageExtensionAllowed } from "../constants/Regexes";
import { validateEnvs } from "../utils/environmentsUtils";
import { PostModel } from '../models/PostModel';

export const create: Handler = async (event: APIGatewayEvent): Promise<DefaultJsonResponse> => {
    try {
        const { POST_BUCKET, error } = validateEnvs(['POST_TABLE', 'POST_BUCKET']);

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
        if (!user) {
            return formatDefaultResponse(400, 'Usuário não encontrado');
        }

        const formData = parse(event, true);
        const file = formData.file as FileData;
        const description = formData.description as string;

        if (!description || description.trim().length < 5) {
            return formatDefaultResponse(400, 'Descrição inválida');
        };

        if (!file || !imageExtensionAllowed.exec(file.filename)) {
            return formatDefaultResponse(400, 'Extensão inválida');
        };

        const imageKey = await new S3Service().saveImage(POST_BUCKET, 'post', file);

        const post = {
            id: Uuid.v4(),
            userId,
            description,
            date: moment().format(),
            image: imageKey
        }

        await PostModel.create(post);
        user.posts = user.posts+1;
        await UserModel.update(user);

        return formatDefaultResponse(200, 'Publicação criada com sucesso');

    } catch (e: any) {
        console.log('Error on create post: ', e);
        return formatDefaultResponse(500, 'Erro ao criar a publicação: ' + e);
    }
}

export const toggleLike: Handler = async (event: any): Promise<DefaultJsonResponse> => {
    try {
        const { error } = validateEnvs(['POST_TABLE']);

        if (error) {
            return formatDefaultResponse(500, error);
        }

        const userId = getUserIdFromEvent(event);
        if (!userId) {
            return formatDefaultResponse(400, 'Usuário não encontrado');
        }

        const user = await UserModel.get({ 'cognitoId': userId });
        if (!user) {
            return formatDefaultResponse(400, 'Usuário não encontrado');
        }

        const {postId} = event.pathParameters;
        const post = await PostModel.get({id: postId});
        if (!post) {
            return formatDefaultResponse(400, 'Publicação não encontrada');
        }

        // verificando se o usuário já curtiu a publicação
        const hasLikedIndex = post.likes.findIndex(obj => {
            const result = obj.toString() === userId;
            return result;
        });

        // caso tenha curtido a publicação
        if(hasLikedIndex != -1){
            post.likes.splice(hasLikedIndex, 1);
            await PostModel.update(post);
            return formatDefaultResponse(200, 'Like removido');
        }else{
            post.likes.push(userId);
            await PostModel.update(post);
            return formatDefaultResponse(200, 'Like inserido');
        }
    } catch (e: any) {
        console.log('Error on toggle like: ', e);
        return formatDefaultResponse(500, 'Erro ao curtir/descurtir a publicação: ' + e);
    }
}