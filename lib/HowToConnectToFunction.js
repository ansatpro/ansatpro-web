"use client";
import { ExecutionMethod } from "appwrite";
import { FUNCTION1_ID, functions, account } from "./appwrite";
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

// Basic Connection
const HowToConnectTofunction = () => {
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
        This is a test shows how to call the function, please click the button,
        you will see "pong"
      </p>
      <button onClick={handleClick}>click me!</button>
      {JSON.stringify(result)}
    </div>
  );
};

// Create Student
const studentData = {
  student_id: "1",
  first_name: "K",
  last_name: "D",
  university_id: "12",
  health_service_id: "34",
  clinic_area_id: "2",
  start_date: "2009-12-31T00:00:00.000Z",
  end_date: "2015-12-31T00:00:00.000Z",
  additional_facilitator_id: null,
  created_by: "12",
  full_name_lower: "k d",
};

const CreateStudent = async (formData) => {
  const user = await account.get();

  const mappedData = {
    student_id: formData.studentId,
    first_name: formData.firstName,
    last_name: formData.lastName,
    university_id: formData.university,
    health_service_id: formData.healthService,
    clinic_area_id: formData.clinicArea,
    start_date: formData.startDate,
    end_date: formData.endDate,
    additional_facilitator_id: formData.additionalFacilitator,
    created_by: user.$id,
    full_name_lower: `${formData.firstName} ${formData.lastName}`.toLowerCase(),
  };

  const res = await functions.createExecution(
    FUNCTION1_ID,
    JSON.stringify(mappedData),
    false,
    "/facilitator/create/student",
    ExecutionMethod.POST
  );
  if (res.responseStatusCode === 200) {
    return "Student created successfully";
  } else {
    throw new Error("Student creation failed");
  }
};

// Get All Students
const GetAllStudents = () => {
  const [result, setResult] = useState(null);
  const handleClick = async () => {
    const user = await account.get();
    const res = await functions.createExecution(
      FUNCTION1_ID,
      JSON.stringify({ created_by: user.$id }),
      false,
      "/facilitator/get/students",
      ExecutionMethod.GET
    );
    setResult(res.responseBody);
  };
  return (
    <div>
      <p>
        This is a test shows how to call the function to get all the students
      </p>
      <button onClick={handleClick}>click me!!!</button>
      {JSON.stringify(result)}
    </div>
  );
};

export default HowToConnectTofunction;
export { CreateStudent, GetAllStudents };
