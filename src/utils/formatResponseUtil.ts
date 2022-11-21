import type {DefaultResponseMessage} from '../types/DefaultResponseMessage';

type DefaultJsonResponse = {
    statusCode: number, 
    headers: object,
    body: string
}

export const formatDefaultResponse = (statusCode: number, message: string | undefined, response?: Record<string, unknown>) : DefaultJsonResponse => {
    const defaultMessage : DefaultResponseMessage = {};

    if(message && statusCode >=200 || message && statusCode <= 399){
        defaultMessage.msg = message;
    }else if(message){
        defaultMessage.error = message;
    }

    return{
        headers : {
            "content-type": "application/json"
        },
        statusCode,
        body: JSON.stringify(response || defaultMessage)
    }
}