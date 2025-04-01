import { Client, Account } from "appwrite";

export const client = new Client();

const PROJECT_ID = "67ebc2ec000c0837dbf2";

client.setEndpoint("https://cloud.appwrite.io/v1").setProject(PROJECT_ID);

export const account = new Account(client);
export { ID } from "appwrite";
