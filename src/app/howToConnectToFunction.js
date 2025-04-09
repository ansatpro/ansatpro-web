"use client";
import { ExecutionMethod } from "appwrite";
import { FUNCTION1_ID, functions } from "../../lib/appwrite";
import { useState } from "react";

// This is the document
// const result = await functions.createExecution(
//     '<FUNCTION_ID>', // functionId
//     '<BODY>', // body (optional)
//     false, // async (optional)
//     '<PATH>', // path (optional)
//     ExecutionMethod.GET, // method (optional)
//     {}, // headers (optional)
//     '' // scheduledAt (optional)
// );

// console.log(result);

const howToConnectTofunction = () => {
  const [result, setResult] = useState(null);
  const handleClick = async () => {
    // Execute the function
    const res = await functions.createExecution(
      FUNCTION1_ID, // functionId
      "", // body (optional)
      false, // async (optional)
      "/ping", // path (use '/ping' to trigger the /ping path in the function)
      ExecutionMethod.GET // method (optional)
    );
    setResult(res.responseBody);
  };
  return (
    <div>
      <p>
        This is a test to how to call the function, please click the button, you
        will see "pong"
      </p>
      <button onClick={handleClick}>click me!</button>
      {JSON.stringify(result)}
    </div>
  );
};

export default howToConnectTofunction;
