import { Client, Databases, ID, Users, Query } from 'node-appwrite';

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  // You can use the Appwrite SDK to interact with other services
  // For this example, we're using the Users service
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const users = new Users(client);

  const DB_ID = process.env.db_id;
  const COLLECTION_ID_USERS_METADATA = process.env.users_metadata;
  const COLLECTION_ID_STUDENTS = process.env.collection_id_students;
  const COLLECTION_ID_PRECEPTOR_FEEDBACKS = process.env.preceptor_feedbacks;
  const COLLECTION_ID_PRECEPTOR_AI_FEEDBACK_ITEMS = process.env.preceptor_ai_feedback_items;
  const COLLECTION_ID_FACILITATOR_REVIEWS = process.env.facilitator_reviews;
  const COLLECTION_ID_FACILITATOR_REVIEW_SCORES = process.env.facilitator_review_scores;



  const db = new Databases(client)

  try {
    const response = await users.list();
    // Log messages and errors to the Appwrite Console
    // These logs won't be seen by your end users
    log(`Total users: ${response.total}`);
  } catch(err) {
    error("Could not list users: " + err.message);
  }

  // The req object contains the request data
  // basic connection
  if (req.path === "/ping") {
    // Use res object to respond with text(), json(), or binary()
    // Don't forget to return a response!
    return res.text("Pong");
  }

  // create a student
  if (req.path === "/facilitator/create/student") {
    switch (req.method) {
      case "POST":
        const {
          student_id,
          first_name,
          last_name,
          university_id,
          health_service_id,
          clinic_area_id,
          start_date,
          end_date,
          additional_facilitator_id,
          created_by,
          full_name_lower
        } = JSON.parse(req.bodyRaw);

        const response_create_student = await db.createDocument(
          DB_ID,
          COLLECTION_ID_STUDENTS,
          ID.unique(),
          {
            student_id,
            first_name,
            last_name,
            university_id,
            health_service_id,
            clinic_area_id,
            start_date,
            end_date,
            additional_facilitator_id,
            created_by,
            full_name_lower
          }
        )
        // return res.json({ message: "Student created", id: response_create_student.$id });
        return res.json({ message: "Student created", id: response_create_student.student_id });

      default:
        return res.json({ message: "Unknown method"})
    }
  }


  // get all the student
  if (req.path === "/facilitator/get/students") {
    switch (req.method) {
      case "GET":
        const allDocuments = [];
        let offset = 0;
        const limit = 100;
        const { created_by } = JSON.parse(req.body);

        while (true) {
          const response = await db.listDocuments(
            DB_ID,
            COLLECTION_ID_STUDENTS,
            [
              Query.equal("created_by", created_by),
              Query.limit(limit),
              Query.offset(offset)
            ]
          );

          allDocuments.push(...response.documents);

          if (response.documents.length < limit) {
            break;
          }

          offset += limit;
        }

        return res.json(allDocuments);
  
      default:
        return res.json({ message: "Unknown method" });
    }
  }

  // delete student
  if (req.path === "/facilitator/student/studentList") {
    switch (req.method) {
      case "DELETE":
        try {
          log(req);
          const { documentID } = JSON.parse(req.body);
          log(documentID);
  
          const response = await db.deleteDocument(
            DB_ID,
            COLLECTION_ID_STUDENTS,
            documentID
          );
  
          return res.json({ message: "Delete successfully", response });
        } catch (error) {
          log("Delete error:", error);
          return res.json({ message: "Failed to delete", error });
        }
  
      default:
        return new Response(JSON.stringify({ message: "Method Not Allowed" }), {
          status: 405,
        });
    }
  }

   // get all the student with all details
   if (req.path === "/facilitator/get/studentsWithAllDetails") {
    switch (req.method) {
      case "GET":
        const allDocuments_students = [];
        let offset = 0;
        const limit = 100;
        const { created_by } = JSON.parse(req.body);

        while (true) {
          const response = await db.listDocuments(
            DB_ID,
            COLLECTION_ID_STUDENTS,
            [
              Query.equal("created_by", created_by),
              Query.limit(limit),
              Query.offset(offset)
            ]
          );

          allDocuments_students.push(...response.documents);

          if (response.documents.length < limit) {
            break;
          }

          offset += limit;
        }

        log(allDocuments_students)
        const student_document_ids = allDocuments_students.map(student => student.$id);
        

        // get student feedback from preceptor
        let allFeedbackDocuments = [];
        let offset2 = 0;
        const limit2 = 100;
        
        while (true) {
          const response = await db.listDocuments(
            DB_ID,
            COLLECTION_ID_PRECEPTOR_FEEDBACKS,
            [
              Query.equal("student_document_id", student_document_ids),
              Query.limit(limit2),
              Query.offset(offset2)
            ]
          );
        
          allFeedbackDocuments.push(...response.documents);
        
          if (response.documents.length < limit2) {
            break; // no more documents
          }
        
          offset2 += limit2;
        }

        log(allFeedbackDocuments);
        const feedback_ids = allFeedbackDocuments.map(feedback => feedback.$id);

        // get the item of the feedback 
        let allFeedbackItems = [];
        let offset3 = 0;
        const limit3 = 100;
        
        while (true) {
          const response = await db.listDocuments(
            DB_ID,
            COLLECTION_ID_PRECEPTOR_AI_FEEDBACK_ITEMS,
            [
              Query.equal("feedback_id", feedback_ids),
              Query.limit(limit3),
              Query.offset(offset3)
            ]
          );
        
          allFeedbackItems.push(...response.documents);
        
          if (response.documents.length < limit3) {
            break; // no more documents
          }
        
          offset3 += limit3;
        }

        log(allFeedbackItems);
        const item_ids = allFeedbackItems.map(item => item.item_id);
        log(item_ids);


        // Merge allFeedbackItems into allFeedbackDocuments, 3 to 2
        // Step 1: Group feedback items by feedback_id
        const feedbackItemsMap = {};

        for (const item of allFeedbackItems) {
          const feedbackId = item.feedback_id;
          if (!feedbackItemsMap[feedbackId]) {
            feedbackItemsMap[feedbackId] = [];
          }
          feedbackItemsMap[feedbackId].push(item);
        }

        // Step 2: Add the items to each feedback document
        const feedbacksWithItems = allFeedbackDocuments.map(feedback => {
          return {
            ...feedback,
            ai_feedback_items: feedbackItemsMap[feedback.$id] || []
          };
        });

        // Group by student_document_id
        const feedbackMap = {};

        for (const feedback of feedbacksWithItems) {
          const studentId = feedback.student_document_id;
          if (!feedbackMap[studentId]) {
            feedbackMap[studentId] = [];
          }
          feedbackMap[studentId].push(feedback);
        }

        // Merge into students
        const studentsWithFeedback = allDocuments_students.map(student => {
          return {
            ...student,
            preceptorFeedbackList: feedbackMap[student.$id] || []
          };
        });







        return res.json(studentsWithFeedback);
  
      default:
        return res.json({ message: "Unknown method" });
    }
  }

  // return res.json({
  //   message: "you are calling function2"
  // });
};
