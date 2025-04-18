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
  const COLLECTION_ID_STUDENTS = process.env.collection_id_students

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
  // if (req.path === "/facilitator/get/students") {
  //   // return res.text("Pong!!");
  //   switch (req.method) {
  //     case "GET":
  //       // return res.text("Pong!hello");
  //       // const response = await db.listDocuments(
  //       //   DB_ID,
  //       //   COLLECTION_ID_STUDENTS
  //       // )
        
  //       let allDocuments = [];
  //       let offset = 0;
  //       const limit = 100; // Max number of documents per request

  //       while (true) {
  //         const response = await db.listDocuments(
  //           DB_ID,
  //           COLLECTION_ID_STUDENTS,
  //           [Query.limit(limit), Query.offset(offset)]
  //         );
          
  //         allDocuments = [...allDocuments, ...response.documents];
          
  //         // If the number of returned documents is less than the limit, we've reached the end
  //         if (response.documents.length < limit) {
  //           break;
  //         }
          
  //         offset += limit; // Move to the next set of documents
  //       }


  //       // return res.json(response)
  //       // const studentIDList = response.documents.map(doc => doc.student_id);
  //       // return res.json(studentIDList)
  //       // const studentsCreatedBySpecificFacilitator = response.documents.filter(doc => doc.created_by === "6801d195000310aae6a3" || doc.created_by === "999");
  //       // return res.json(studentsCreatedBySpecificFacilitator);
  //       const createdByList = response.documents.map(doc => doc.created_by);
  //       return res.json(createdByList)

  //     default:
  //       return res.json({ message: "Unknown method"})
  //   }
  // }

  // if (req.path === "/facilitator/get/students") {
  //   switch (req.method) {
  //     case "GET":
  //       let allDocuments = [];
  //       let offset = 0;
  //       const limit = 100; // Max number of documents per request
  
  //       while (true) {
  //         const response = await db.listDocuments(
  //           DB_ID,
  //           COLLECTION_ID_STUDENTS,
  //           [Query.limit(limit), Query.offset(offset)]
  //         );
          
  //         allDocuments = [...allDocuments, ...response.documents];
          
  //         // If the number of returned documents is less than the limit, we've reached the end
  //         if (response.documents.length < limit) {
  //           break;
  //         }
          
  //         offset += limit; // Move to the next set of documents
  //       }
  
  
  //       const studentsCreatedBySpecificFacilitator = allDocuments.filter(doc => doc.created_by === "6801d195000310aae6a3");

  //       return res.json(studentsCreatedBySpecificFacilitator);
  
  //     default:
  //       return res.json({ message: "Unknown method" });
  //   }
  // }

  if (req.path === "/facilitator/get/students") {
    switch (req.method) {
      case "GET":
        const allDocuments = [];
        let offset = 0;
        const limit = 100;
        // const createdBy = "6801d195000310aae6a3";
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


  // return res.json({
  //   message: "you are calling function2"
  // });
};
