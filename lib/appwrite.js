import { Client, Account } from "@appwrite/sdk";

const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1") // Appwrite 服务器地址
  .setProject("your-project-id"); // 替换为你的 Appwrite 项目 ID

export const account = new Account(client);