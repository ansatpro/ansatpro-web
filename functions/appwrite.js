import { Client, Account, Functions } from "appwrite";

export const client = new Client();

const PROJECT_ID = "67ebc2ec000c0837dbf2";

client.setEndpoint("https://cloud.appwrite.io/v1").setProject(PROJECT_ID);

export const account = new Account(client);
export { ID } from "appwrite";

export const FUNCTION1_ID = "67f6365b002fda518353";

// Initialize the Functions service
export const functions = new Functions(client);
