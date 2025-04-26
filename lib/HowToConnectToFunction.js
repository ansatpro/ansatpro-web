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

// Get All notifications
const GetAllNotifications = async () => {
  const user = await account.get();
  const res = await functions.createExecution(
    FUNCTION1_ID,
    JSON.stringify({ recipient_id: user.$id }),
    false,
    "/facilitator/get/notifications",
    ExecutionMethod.GET
  );
  if (res.responseStatusCode === 200) {
    const rawData = JSON.parse(res.responseBody);
    // Convert backend data to frontend format
    const notifications = rawData.map((doc) => ({
      documentID: doc.$id,
      messageTime: doc.$createdAt,
      facilitator_id: doc.recipient_id,
      message: doc.message,
      is_read: doc.is_read,
    }));

    return notifications;
  } else {
    throw new Error("Student fetching failed");
  }
};

// Get All Students
const GetAllStudents = async () => {
  const user = await account.get();
  const res = await functions.createExecution(
    FUNCTION1_ID,
    JSON.stringify({ created_by: user.$id }),
    false,
    "/facilitator/get/students",
    ExecutionMethod.GET
  );
  if (res.responseStatusCode === 200) {
    const rawData = JSON.parse(res.responseBody);

    // Convert backend data to frontend format
    const students = rawData.map((doc) => ({
      documentID: doc.$id,
      firstName: doc.first_name,
      lastName: doc.last_name,
      studentId: doc.student_id,
      university: doc.university_id,
      healthService: doc.health_service_id,
      clinicArea: doc.clinic_area_id,
      additionalFacilitator: doc.additional_facilitator_id,
      startDate: doc.start_date.split("T")[0],
      endDate: doc.end_date.split("T")[0],
    }));

    return students;
  } else {
    throw new Error("Student fetching failed");
  }
};

// delete student
const DeleteStudent = async (documentID) => {
  const res = await functions.createExecution(
    FUNCTION1_ID,
    JSON.stringify({ documentID }),
    false,
    "/facilitator/student/studentList",
    ExecutionMethod.DELETE
  );
  return res;
};

// Get studentsWithAllDetails
const GetAllStudentsWithDetails = async () => {
  const user = await account.get();
  const res = await functions.createExecution(
    FUNCTION1_ID,
    JSON.stringify({ created_by: user.$id }),
    false,
    "/facilitator/get/studentsWithAllDetails",
    ExecutionMethod.GET
  );
  if (res.responseStatusCode === 200) {
    const rawData = JSON.parse(res.responseBody);

    return rawData;
  } else {
    throw new Error("Student fetching failed");
  }
};

// post facilitator comments
const PostFacilitatorComments = async (submissionData) => {
  const user = await account.get();
  const mappedData = {
    preceptor_feedback_document_id: submissionData.feedbackId,
    facilitator_id: user.$id,
    comment: submissionData.comment,
    flag_discussed_with_student:
      submissionData.discussedWithStudent.toLowerCase() === "yes",
    discussion_date: submissionData.discussionDate,
    ratedItems: (submissionData.ratedItems || []).map((item) => ({
      itemId: item.itemId,
      rating: String(item.rating),
    })),
  };

  const res = await functions.createExecution(
    FUNCTION1_ID,
    JSON.stringify(mappedData),
    false,
    "/facilitator/post/studentReview",
    ExecutionMethod.POST
  );
  if (res.responseStatusCode === 200) {
    const rawData = JSON.parse(res.responseBody);

    return rawData;
  } else {
    throw new Error("Facilitator post student comments failed");
  }
};

export default HowToConnectTofunction;
export {
  CreateStudent,
  GetAllStudents,
  DeleteStudent,
  GetAllStudentsWithDetails,
  PostFacilitatorComments,
  GetAllNotifications,
};
