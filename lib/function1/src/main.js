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
  const COLLECTION_ID_ASSESSMENT_ITEMS = process.env.assessment_items;
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
  //  if (req.path === "/facilitator/get/studentsWithAllDetails") {
  //   switch (req.method) {
  //     case "GET":
  //       const allDocuments_students = [];
  //       let offset = 0;
  //       const limit = 100;
  //       const { created_by } = JSON.parse(req.body);

  //       while (true) {
  //         const response = await db.listDocuments(
  //           DB_ID,
  //           COLLECTION_ID_STUDENTS,
  //           [
  //             Query.equal("created_by", created_by),
  //             Query.limit(limit),
  //             Query.offset(offset)
  //           ]
  //         );

  //         allDocuments_students.push(...response.documents);

  //         if (response.documents.length < limit) {
  //           break;
  //         }

  //         offset += limit;
  //       }

  //       log(allDocuments_students)
  //       const student_document_ids = allDocuments_students.map(student => student.$id);
        

  //       // get student feedback from preceptor
  //       let allFeedbackDocuments = [];
  //       let offset2 = 0;
  //       const limit2 = 100;
        
  //       while (true) {
  //         const response = await db.listDocuments(
  //           DB_ID,
  //           COLLECTION_ID_PRECEPTOR_FEEDBACKS,
  //           [
  //             Query.equal("student_document_id", student_document_ids),
  //             Query.limit(limit2),
  //             Query.offset(offset2)
  //           ]
  //         );
        
  //         allFeedbackDocuments.push(...response.documents);
        
  //         if (response.documents.length < limit2) {
  //           break; // no more documents
  //         }
        
  //         offset2 += limit2;
  //       }

  //       log(allFeedbackDocuments);
  //       const feedback_ids = allFeedbackDocuments.map(feedback => feedback.$id);
  //       log(feedback_ids);




  //       // get the item of the feedback 
  //       let allFeedbackItems = [];
  //       let offset3 = 0;
  //       const limit3 = 100;
        
  //       while (true) {
  //         const response = await db.listDocuments(
  //           DB_ID,
  //           COLLECTION_ID_PRECEPTOR_AI_FEEDBACK_ITEMS,
  //           [
  //             Query.equal("feedback_id", feedback_ids),
  //             Query.limit(limit3),
  //             Query.offset(offset3)
  //           ]
  //         );
        
  //         allFeedbackItems.push(...response.documents);
        
  //         if (response.documents.length < limit3) {
  //           break; // no more documents
  //         }
        
  //         offset3 += limit3;
  //       }

  //       log(allFeedbackItems);
  //       const item_ids = allFeedbackItems.map(item => item.item_id);
  //       log(item_ids);

  //       // Get item description from assessment_items
  //       let allItemDescription = [];
  //       let offset4 = 0;
  //       const limit4 = 100;
        
  //       while (true) {
  //         const response = await db.listDocuments(
  //           DB_ID,
  //           COLLECTION_ID_ASSESSMENT_ITEMS,
  //           [
  //             Query.equal("item_id", item_ids),
  //             Query.limit(limit4),
  //             Query.offset(offset4)
  //           ]
  //         );
        
  //         allItemDescription.push(...response.documents);
        
  //         if (response.documents.length < limit4) {
  //           break; // no more documents
  //         }
        
  //         offset4 += limit4;
  //       }

  //       log(allItemDescription);

  //       // Get Description

  //       const itemDescriptionMap = {};
  //       for (const desc of allItemDescription) {
  //         itemDescriptionMap[desc.item_id] = desc; // or just `desc.description` if you only want description
  //       }

  //       const allFeedbackItemsWithDescriptions = allFeedbackItems.map(item => {
  //         return {
  //           ...item,
  //           item_details: itemDescriptionMap[item.item_id] || null
  //         };
  //       });

  //       const feedbackItemsMap = {};

  //       for (const item of allFeedbackItemsWithDescriptions) {
  //         const feedbackId = item.feedback_id;
  //         if (!feedbackItemsMap[feedbackId]) {
  //           feedbackItemsMap[feedbackId] = [];
  //         }
  //         feedbackItemsMap[feedbackId].push(item);
  //       }

  //       const feedbacksWithItems = allFeedbackDocuments.map(feedback => {
  //         return {
  //           ...feedback,
  //           ai_feedback_items: feedbackItemsMap[feedback.$id] || []
  //         };
  //       });

  //       const feedbackMap = {};

  //       for (const feedback of feedbacksWithItems) {
  //         const studentId = feedback.student_document_id;
  //         if (!feedbackMap[studentId]) {
  //           feedbackMap[studentId] = [];
  //         }
  //         feedbackMap[studentId].push(feedback);
  //       }

  //               // Get each review for each feedback
  //               let allReviewDocuments = [];
  //               let offset5 = 0;
  //               const limit5 = 100;
                
  //               while (true) {
  //                 const response = await db.listDocuments(
  //                   DB_ID,
  //                   COLLECTION_ID_FACILITATOR_REVIEWS,
  //                   [
  //                     Query.equal("preceptor_feedback_document_id", feedback_ids),
  //                     Query.limit(limit5),
  //                     Query.offset(offset5)
  //                   ]
  //                 );
                
  //                 allReviewDocuments.push(...response.documents);
                
  //                 if (response.documents.length < limit5) {
  //                   break; // no more documents
  //                 }
                
  //                 offset5 += limit5;
  //               }
        
  //               //  Merge Reviews into Feedbacks
  //               const reviewMap = {};
  //               for (const review of allReviewDocuments) {
  //                 const feedbackId = review.preceptor_feedback_document_id;
  //                 reviewMap[feedbackId] = review;
  //               }
        
  //               const feedbacksWithItemsAndReviews = allFeedbackDocuments.map(feedback => {
  //                 return {
  //                   ...feedback,
  //                   ai_feedback_items: feedbackItemsMap[feedback.$id] || [],
  //                   review: reviewMap[feedback.$id] || null
  //                 };
  //               });





  //       const studentsWithFeedback = allDocuments_students.map(student => {
  //         return {
  //           ...student,
  //           preceptorFeedbackList: feedbackMap[student.$id] || []
  //         };
  //       });


  //       return res.json(studentsWithFeedback);
  
  //     default:
  //       return res.json({ message: "Unknown method" });
  //   }
  // }

// Get all students with their full feedback details
if (req.path === "/facilitator/get/studentsWithAllDetails") {
  switch (req.method) {
    case "GET":
      const allDocuments_students = [];
      let offset = 0;
      const limit = 100;
      const { created_by } = JSON.parse(req.body);

      // 1. Get all students created by this facilitator
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
        if (response.documents.length < limit) break;
        offset += limit;
      }

      log(allDocuments_students);
      const student_document_ids = allDocuments_students.map(student => student.$id);

      // 2. Get all feedbacks for these students
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
        if (response.documents.length < limit2) break;
        offset2 += limit2;
      }

      log(allFeedbackDocuments);
      const feedback_ids = allFeedbackDocuments.map(f => f.$id);

      // 3. Get all feedback items (AI-generated) for these feedbacks
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
        if (response.documents.length < limit3) break;
        offset3 += limit3;
      }

      log(allFeedbackItems);
      const item_ids = allFeedbackItems.map(item => item.item_id);
      log(item_ids);

      // 4. Get descriptions for those assessment item_ids
      let allItemDescription = [];
      let offset4 = 0;
      const limit4 = 100;

      while (true) {
        const response = await db.listDocuments(
          DB_ID,
          COLLECTION_ID_ASSESSMENT_ITEMS,
          [
            Query.equal("item_id", item_ids),
            Query.limit(limit4),
            Query.offset(offset4)
          ]
        );

        allItemDescription.push(...response.documents);
        if (response.documents.length < limit4) break;
        offset4 += limit4;
      }

      log(allItemDescription);

      // 5. Create a map of item_id => description
      const itemDescriptionMap = {};
      for (const desc of allItemDescription) {
        itemDescriptionMap[desc.item_id] = desc;
      }

      // 6. Add description into feedback items
      const allFeedbackItemsWithDescriptions = allFeedbackItems.map(item => ({
        ...item,
        item_details: itemDescriptionMap[item.item_id] || null
      }));

      // 7. Create a map: feedback_id => [items]
      const feedbackItemsMap = {};
      for (const item of allFeedbackItemsWithDescriptions) {
        const feedbackId = item.feedback_id;
        if (!feedbackItemsMap[feedbackId]) {
          feedbackItemsMap[feedbackId] = [];
        }
        feedbackItemsMap[feedbackId].push(item);
      }

      // 8. Get all facilitator reviews (linked to feedback)
      let allReviewDocuments = [];
      let offset5 = 0;
      const limit5 = 100;

      while (true) {
        const response = await db.listDocuments(
          DB_ID,
          COLLECTION_ID_FACILITATOR_REVIEWS,
          [
            Query.equal("preceptor_feedback_document_id", feedback_ids),
            Query.limit(limit5),
            Query.offset(offset5)
          ]
        );

        allReviewDocuments.push(...response.documents);
        if (response.documents.length < limit5) break;
        offset5 += limit5;
      }

      const review_ids = allReviewDocuments.map(r => r.$id);
      log(review_ids)

      // Get all facilitator review scores
      let allReviewScoresDocuments = [];
      let offset6 = 0;
      const limit6 = 100;

      while (true) {
        const response = await db.listDocuments(
          DB_ID,
          COLLECTION_ID_FACILITATOR_REVIEW_SCORES,
          [
            Query.equal("review_id", review_ids),
            Query.limit(limit6),
            Query.offset(offset6)
          ]
        );

        allReviewScoresDocuments.push(...response.documents);
        if (response.documents.length < limit6) break;
        offset6 += limit6;
      }

      log(allReviewScoresDocuments)



      // 9. Create a map: feedback_id => review
      const reviewMap = {};
      for (const review of allReviewDocuments) {
        reviewMap[review.preceptor_feedback_document_id] = review;
      }

      // 10. Add items + reviews to each feedback
      const feedbacksWithItemsAndReviews = allFeedbackDocuments.map(feedback => ({
        ...feedback,
        ai_feedback_items: feedbackItemsMap[feedback.$id] || [],
        review: reviewMap[feedback.$id] || null
      }));

      // 11. Group feedbacks by student
      const feedbackMap = {};
      for (const feedback of feedbacksWithItemsAndReviews) {
        const studentId = feedback.student_document_id;
        if (!feedbackMap[studentId]) {
          feedbackMap[studentId] = [];
        }
        feedbackMap[studentId].push(feedback);
      }

      // 12. Combine students with their feedback
      const studentsWithFeedback = allDocuments_students.map(student => ({
        ...student,
        preceptorFeedbackList: feedbackMap[student.$id] || []
      }));

      // 13. Send JSON response
      return res.json(studentsWithFeedback);
  }
}

};
