import { Client, Account } from "@appwrite/sdk";

const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1") // Appwrite server endpoint
  .setProject("your-project-id"); // replace with your project ID

export const account = new Account(client);