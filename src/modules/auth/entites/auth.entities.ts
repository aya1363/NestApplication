import { loginCredentialsResponse } from "src/common/entities";

export class loginResponse{
    message: string 
    data:{credentials:loginCredentialsResponse}
}