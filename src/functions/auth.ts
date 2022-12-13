import { Handler, APIGatewayEvent } from "aws-lambda";
import { UserRegisterRequest } from "../types/auth/UserRegisterRequest";
import { DefaultJsonResponse, formatDefaultResponse } from "../utils/formatResponseUtil";
import { passwordRegex, emailRegex, imageExtensionAllowed } from '../constants/Regexes';
import { ConfirmEmailRequest } from "../types/auth/ConfirmEmailRequest";
import { FileData } from 'aws-multipart-parser/dist/models';
import { CognitoServices } from "../../services/CognitoServices";
import { User } from "../types/models/User";
import { UserModel } from "../models/UserModel";
import { parse } from 'aws-multipart-parser';
import { S3Service } from "../../services/S3Services";

export const register: Handler = async (event: APIGatewayEvent): Promise<DefaultJsonResponse> => {
     try {
          const { USER_POOL_ID, USER_CLIENT_ID, USER_TABLE, AVATAR_BUCKET } = process.env;
          if (!USER_POOL_ID || !USER_CLIENT_ID) {
               return formatDefaultResponse(500, 'Cognito Environments não encontradas');
          }

          if (!USER_TABLE) {
               return formatDefaultResponse(500, 'Envs de tabelas do dynamo não encontradas');
          }

          if (!AVATAR_BUCKET) {
               return formatDefaultResponse(500, 'Envs do bucket de avatar não encontradas');
          }

          if (!event.body) {
               return formatDefaultResponse(400, 'Parâmetros de entrada não informados');
          }

          const formData = parse(event, true);

          const file = formData.file as FileData;
          const name = formData.name as string;
          const email = formData.email as string;
          const password = formData.password as string;
          
          
          if (!email || !email.match(emailRegex)) {
               return formatDefaultResponse(400, 'Email inválido');
          }
          if (!password || !password.match(passwordRegex)) {
               return formatDefaultResponse(400, 'Senha inválida, senha deve conter pelo menos um caractér maiúsculo, minúsculo, numérico e especial, além de ter pelo menos oito dígitos.');
          }
          if (!name || name.trim().length < 2) {
               return formatDefaultResponse(400, 'Nome inválido');
          }

          if(file && !imageExtensionAllowed.exec(file.filename)){
               return formatDefaultResponse(400, 'Extensão inválida');
          }
          
          const cognitoUser = await new CognitoServices(USER_POOL_ID, USER_CLIENT_ID).signUp(email, password);

          let key = ''
          if(file){
               key = await new S3Service().saveImage(AVATAR_BUCKET, 'avatar', file);
          }


          const user = {
               name,
               email,
               cognitoId: cognitoUser.userSub,
               avatar: key
          } as User;

          await UserModel.create(user)
          return formatDefaultResponse(200, 'Usuario cadastrado com sucesso, verifique seu email para confirmar o codigo!');

     } catch (error) {
          console.log('Error on register user: ', error)
          return formatDefaultResponse(500, 'Erro ao cadastrar usuário, tente novamente ou entre em contato com o administrador');
     }
}

export const confirmEmail: Handler = async (event: APIGatewayEvent): Promise<DefaultJsonResponse> => {
     try {
          const { USER_POOL_ID, USER_CLIENT_ID } = process.env;
          if (!USER_POOL_ID || !USER_CLIENT_ID) {
               return formatDefaultResponse(500, 'Cognito Environments não encontradas');
          }
          if (!event.body) {
               return formatDefaultResponse(400, 'Parâmetros de entrada não informados');
          }
          const request = JSON.parse(event.body) as ConfirmEmailRequest;
          const { email, verificationCode } = request;
          if (!email || !email.match(emailRegex)) {
               return formatDefaultResponse(400, 'Email inválido');
          }
          if (!verificationCode || verificationCode.length !== 6) {
               return formatDefaultResponse(400, 'Código de confirmação inválido');
          }
          await new CognitoServices(USER_POOL_ID, USER_CLIENT_ID).confirmEmail(email, verificationCode);
          return formatDefaultResponse(200, 'Email confirmado com sucesso!');
     } catch (e: any) {
          console.log('Error on confirm user email: ', e);
          return formatDefaultResponse(500, 'Erro ao confirmar email do usuário: ' + e);
     }
}