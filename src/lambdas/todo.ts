import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import {  DynamoRepo } from '../repositories/dynamodb'


async function createTodoHandler(event: APIGatewayEvent): Promise<APIGatewayProxyResult>{
    const BAD_REQUEST_MESSAGE = 'Os campos necessários não foram passados.'
    try{

        const { userId } = event.pathParameters as { userId?: string}
        if(!event.body){
            throw new Error(BAD_REQUEST_MESSAGE);
        }
        const { title, done, deadline} = JSON.parse(event.body) as { title?: string, done?: boolean, deadline?: string} ;
        const dynamoClient = new DynamoRepo();
        if(!title || typeof done !== 'boolean' || !deadline || !userId) throw new Error(BAD_REQUEST_MESSAGE);
        const result = await dynamoClient.create({
            userId,
            title,
            done,
            deadline
        })
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        }
    } catch(e) {
        console.log(e)
        return {
            statusCode: e.message == BAD_REQUEST_MESSAGE ? 400 : 404,
            body: JSON.stringify({
                error: e.message == BAD_REQUEST_MESSAGE ? BAD_REQUEST_MESSAGE : "Todo não encontrado."
            })
        }
    }
}

async function listTodoByUserIdHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>{
    try{

        const {userId} = event.pathParameters as {userId: string};
        const dynamoClient = new DynamoRepo();
        const result = await dynamoClient.findItemByUserId(userId);

        return {
            body: JSON.stringify(result),
            statusCode: 200
        }
    } catch(e) {
        return {
            body: JSON.stringify(e),
            statusCode: 404
        }
    }
}

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    if(event.httpMethod === "POST"){
        return await createTodoHandler(event)
    }
    if(event.httpMethod === "GET"){
        return await listTodoByUserIdHandler(event);
    }
    return {
        statusCode: 200,
        body: JSON.stringify({
            error: 'Método Http recusado. É permitido apenas métodos GET e POST.'
        })
    }
}