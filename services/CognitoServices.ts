import { CognitoUserPool } from "amazon-cognito-identity-js"; 

export class CognitoService{
    constructor(private userPoolId: string, private userPoolClient: string){}

    public signUp = (email: string, password: string) : Promise<any> => {
        return new Promise((resolve, reject) => {
            try {

                // Dados do Pool de usuário, o Cognito não funciona sem
                const poolData = {
                    UserPoolId: this.userPoolId,
                    ClientId: this.userPoolClient 
                };
                
                const userPool = new CognitoUserPool(poolData);
                const userAttributes = []
                
                userPool.signUp(email, password, userAttributes, userAttributes, (err, result) => {
                    if(err){
                        return reject(err)
                    }
                    
                    resolve(result)
                });
            } catch (error) {
                reject(error)
            }
        })
    }
}

 