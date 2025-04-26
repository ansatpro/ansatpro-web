import { Client, Account, Functions, Storage } from 'appwrite';
import { Client, Account, Functions } from "appwrite";

export const client = new Client();

client
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("67ebc2ec000c0837dbf2"); // Replace with your project ID

export const realtimeClient = new Client();
realtimeClient
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject("67ebc2ec000c0837dbf2");

export const account = new Account(client);
export { ID } from "appwrite";
export const functions = new Functions(client);
export const storage = new Storage(client);

// Helper function to check if user is authenticated
export const checkAuth = async () => {
    try {
        const user = await account.get();
        return user;
    } catch (error) {
        return null;
    }
};

// Helper function to get JWT token
export const getJWT = async () => {
    try {
        const token = await account.createJWT();
        return token.jwt;
    } catch (error) {
        return null;
    }
};
