import {DynamoDB } from 'aws-sdk'
import { v4 } from 'uuid'

interface ICreateTodo {
    id?: string,
    userId: string,
    title: string,
    done: boolean,
    deadline: string
}

export class DynamoRepo{ 
    DB: DynamoDB;
    constructor(){
        this.DB = new DynamoDB({
            region: 'us-east-1',
            endpoint: 'http://localhost:8000',
            
        })
    }
    async findItemByUserId(userId: string){
        const result = await this.DB.query({
            TableName: 'todoTable',
            IndexName: "userIdIndex",
            KeyConditionExpression: "user_id = :user_id",
            ExpressionAttributeValues: {
                ":user_id": {
                    S: userId
                }
            }
            
        }).promise()
        return result.Items?.map(item => {
            return DynamoDB.Converter.unmarshall(item)
        })
    }

    async listAll(){
        return await this.DB.scan({
            TableName: 'todoTable',
        }).promise()
    }
    async create({ userId, title, done, deadline} : ICreateTodo){
        const id = v4();
        console.log(typeof (new Date(deadline).toString()))
        await this.DB.putItem({
            TableName: 'todoTable',
            Item: {
                id: {
                    S: id
                },
                user_id: {
                    S: userId
                },
                title: {
                    S: title
                },
                done: {
                    BOOL: done
                },
                deadline: {
                    S: new Date(deadline).toISOString()
                }

            }
        }).promise()
        return {
            id,
            user_id: userId,
            title,
            done: false,
            deadline
        }
    }
}