import { Client, Users } from 'node-appwrite';

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  log('Function started');
  log('Request body:', req.body);

  const { jwt, action, payload } = JSON.parse(req.body || '{}');
  log('Parsed data:', { jwt, action, payload });

  if (!jwt || !action) {
    log('Missing required fields');
    return res.json({
      status: "error",
      message: "Missing required fields: jwt or action"
    });
  }

  log('Returning success response');
  return res.json({
    status: "success",
    data: {
      jwt,
      action,
      payload
    }
  });


  // // You can use the Appwrite SDK to interact with other services
  // // For this example, we're using the Users service
  // const client = new Client()
  //   .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
  //   .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  //   .setKey(req.headers['x-appwrite-key'] ?? '');
  // const users = new Users(client);

  // try {
  //   const response = await users.list();
  //   // Log messages and errors to the Appwrite Console
  //   // These logs won't be seen by your end users
  //   log(`Total users: ${response.total}`);
  // } catch(err) {
  //   error("Could not list users: " + err.message);
  // }

  // // The req object contains the request data
  // if (req.path === "/ping") {
  //   // Use res object to respond with text(), json(), or binary()
  //   // Don't forget to return a response!
  //   return res.text("Pong");
  // }

  // return res.json({
  //   motto: "Build like a team of hundreds_",
  //   learn: "https://appwrite.io/docs",
  //   connect: "https://appwrite.io/discord",
  //   getInspired: "https://builtwith.appwrite.io",
  // });
};
