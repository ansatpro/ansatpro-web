import { Client, Databases, ID, Users, Query } from 'node-appwrite';
import Groq from 'groq-sdk';

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  // You can use the Appwrite SDK to interact with other services
  // For this example, we're using the Users service
  const project_API_key = process.env.project_API_key;

  // const client = new Client()
  //   .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
  //   .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  //   .setKey(req.headers['x-appwrite-key'] ?? '');
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(project_API_key);
  const users = new Users(client);

  const DB_ID = process.env.db_id;
  const COLLECTION_ID_USERS_METADATA = process.env.users_metadata;
  const COLLECTION_ID_STUDENTS = process.env.collection_id_students;
  const COLLECTION_ID_PRECEPTOR_FEEDBACKS = process.env.preceptor_feedbacks;
  const COLLECTION_ID_PRECEPTOR_AI_FEEDBACK_ITEMS =
    process.env.preceptor_ai_feedback_items;
  const COLLECTION_ID_ASSESSMENT_ITEMS = process.env.assessment_items;
  const COLLECTION_ID_FACILITATOR_REVIEWS = process.env.facilitator_reviews;
  const COLLECTION_ID_FACILITATOR_REVIEW_SCORES =
    process.env.facilitator_review_scores;
  const COLLECTION_ID_EMAIL_VERIFICATION_TOKENS =
    process.env.email_verification_tokens;
  const COLLECTION_ID_NOTIFICATIONS = process.env.notifications;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  const db = new Databases(client);

  try {
    const response = await users.list();
    // Log messages and errors to the Appwrite Console
    // These logs won't be seen by your end users
    log(`Total users: ${response.total}`);
  } catch (err) {
    error('Could not list users: ' + err.message);
  }

  // The req object contains the request data
  // basic connection
  if (req.path === '/ping') {
    // Use res object to respond with text(), json(), or binary()
    // Don't forget to return a response!
    return res.text('Pong');
  }

  // Email verification endpoints
  if (req.path === '/auth/email/send-verification') {
    switch (req.method) {
      case 'POST':
        try {
          const { email, userId } = JSON.parse(req.bodyRaw);

          if (!email || !userId) {
            return res.json(
              {
                success: false,
                message: 'Email and userId are required',
              },
              400
            );
          }

          // Generate a random token
          const token =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);

          // Store the token in the database
          await db.createDocument(
            DB_ID,
            COLLECTION_ID_EMAIL_VERIFICATION_TOKENS,
            ID.unique(),
            {
              email,
              token,
              isUsed: false,
              userId,
            }
          );

          // Create verification link
          const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email?token=${token}`;

          // Send email using MailerSend
          const mailersendApiKey = process.env.NEXT_PUBLIC_MAILERSEND_API_KEY;
          const mailersendEndpoint = 'https://api.mailersend.com/v1/email';

          const emailData = {
            from: {
              email: 'noreply@ansatpro.com',
              name: 'ANSAT Pro',
            },
            to: [
              {
                email: email,
                name: 'User',
              },
            ],
            subject: 'Verify your email for ANSAT Pro',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3A6784;">Welcome to ANSAT Pro!</h2>
                <p>Thank you for registering. To complete your registration, please verify your email address by clicking the button below:</p>
                <a href="${verificationLink}" style="display: inline-block; background-color: #3A6784; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Verify Email</a>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all;">${verificationLink}</p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't request this email, please ignore it.</p>
              </div>
            `,
          };

          try {
            const response = await fetch(mailersendEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${mailersendApiKey}`,
              },
              body: JSON.stringify(emailData),
            });

            if (!response.ok) {
              throw new Error(`Email sending failed: ${response.statusText}`);
            }

            return res.json({
              success: true,
              message: 'Verification email sent successfully',
            });
          } catch (emailError) {
            error(`Failed to send email: ${emailError.message}`);
            return res.json(
              {
                success: false,
                message: 'Failed to send verification email',
              },
              500
            );
          }
        } catch (err) {
          error(`Error in send-verification: ${err.message}`);
          return res.json(
            {
              success: false,
              message: 'Internal server error',
            },
            500
          );
        }
        break;

      default:
        return res.json(
          {
            success: false,
            message: 'Method not allowed',
          },
          405
        );
    }
  }

  if (req.path === '/auth/email/verify') {
    switch (req.method) {
      case 'POST':
        try {
          const { token } = JSON.parse(req.bodyRaw);

          if (!token) {
            return res.json(
              {
                success: false,
                message: 'Token is required',
              },
              400
            );
          }

          // Find the token in the database
          const tokensResult = await db.listDocuments(
            DB_ID,
            COLLECTION_ID_EMAIL_VERIFICATION_TOKENS,
            [Query.equal('token', token), Query.equal('isUsed', false)]
          );

          if (tokensResult.documents.length === 0) {
            return res.json(
              {
                success: false,
                message: 'Invalid or expired token',
              },
              400
            );
          }

          const tokenDoc = tokensResult.documents[0];

          // Mark the token as used
          await db.updateDocument(
            DB_ID,
            COLLECTION_ID_EMAIL_VERIFICATION_TOKENS,
            tokenDoc.$id,
            {
              isUsed: true,
            }
          );

          // Optionally update user's email verification status in Appwrite
          try {
            await users.updateEmailVerification(tokenDoc.userId, true);
          } catch (userError) {
            log(
              `Failed to update user verification status: ${userError.message}`
            );
            // Continue anyway as we've verified the email
          }

          return res.json({
            success: true,
            message: 'Email verified successfully',
          });
        } catch (err) {
          error(`Error in verify: ${err.message}`);
          return res.json(
            {
              success: false,
              message: 'Internal server error',
            },
            500
          );
        }
        break;

      default:
        return res.json(
          {
            success: false,
            message: 'Method not allowed',
          },
          405
        );
    }
  }

  // create a student
  if (req.path === '/facilitator/create/student') {
    switch (req.method) {
      case 'POST':
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
          full_name_lower,
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
            full_name_lower,
          }
        );
        // return res.json({ message: "Student created", id: response_create_student.$id });
        return res.json({
          message: 'Student created',
          id: response_create_student.student_id,
        });

      default:
        return res.json({ message: 'Unknown method' });
    }
  }

  // get all the notifications
  if (req.path === '/facilitator/get/notifications') {
    switch (req.method) {
      case 'GET':
        const allDocuments = [];
        let offset = 0;
        const limit = 100;
        const { recipient_id } = JSON.parse(req.body);

        while (true) {
          const response = await db.listDocuments(
            DB_ID,
            COLLECTION_ID_NOTIFICATIONS,
            [
              Query.equal('recipient_id', recipient_id),
              Query.limit(limit),
              Query.offset(offset),
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
        return res.json({ message: 'Unknown method' });
    }
  }

  // get all the student
  if (req.path === '/facilitator/get/students') {
    switch (req.method) {
      case 'GET':
        const allDocuments = [];
        let offset = 0;
        const limit = 100;
        const { created_by } = JSON.parse(req.body);

        while (true) {
          const response = await db.listDocuments(
            DB_ID,
            COLLECTION_ID_STUDENTS,
            [
              Query.equal('created_by', created_by),
              Query.limit(limit),
              Query.offset(offset),
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
        return res.json({ message: 'Unknown method' });
    }
  }

  // delete student
  if (req.path === '/facilitator/student/studentList') {
    switch (req.method) {
      case 'DELETE':
        try {
          log(req);
          const { documentID } = JSON.parse(req.body);
          log(documentID);

          const response = await db.deleteDocument(
            DB_ID,
            COLLECTION_ID_STUDENTS,
            documentID
          );

          return res.json({ message: 'Delete successfully', response });
        } catch (error) {
          log('Delete error:', error);
          return res.json({ message: 'Failed to delete', error });
        }

      default:
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
          status: 405,
        });
    }
  }

  // get all students with all details  original one, keep for a while
  if (req.path === '/facilitator/get/studentsWithAllDetails1') {
    log('hi', req);
    switch (req.method) {
      case 'GET':
        log('hello', req);
        const allDocuments_students = [];
        let offset = 0;
        const limit = 100;
        // const { created_by } = JSON.parse(req.body);
        const created_by = req.bodyJson?.created_by;

        // 1. Get all students created by this facilitator
        while (true) {
          const response = await db.listDocuments(
            DB_ID,
            COLLECTION_ID_STUDENTS,
            [
              Query.equal('created_by', created_by),
              Query.limit(limit),
              Query.offset(offset),
            ]
          );

          allDocuments_students.push(...response.documents);
          if (response.documents.length < limit) break;
          offset += limit;
        }

        const student_document_ids = allDocuments_students.map(
          (student) => student.$id
        );

        // 2. Get all feedbacks for these students
        let allFeedbackDocuments = [];
        let offset2 = 0;
        const limit2 = 100;

        while (true) {
          const response = await db.listDocuments(
            DB_ID,
            COLLECTION_ID_PRECEPTOR_FEEDBACKS,
            [
              Query.equal('student_document_id', student_document_ids),
              Query.limit(limit2),
              Query.offset(offset2),
            ]
          );

          allFeedbackDocuments.push(...response.documents);
          if (response.documents.length < limit2) break;
          offset2 += limit2;
        }

        const feedback_ids = allFeedbackDocuments.map((f) => f.$id);

        // 2.5. Get Preceptor Details
        const preceptor_ids = [
          ...new Set(allFeedbackDocuments.map((p) => p.preceptor_id)),
        ];

        const preceptorDetailsMap = {};

        for (const preceptor_id of preceptor_ids) {
          try {
            const preceptor = await users.get(preceptor_id); // You may need to replace 'users.get' with your Appwrite user function
            preceptorDetailsMap[preceptor_id] = preceptor;
          } catch (error) {
            console.error(`Failed to get preceptor ${preceptor_id}`, error);
            preceptorDetailsMap[preceptor_id] = null;
          }
        }

        // 3. Get all feedback items (AI-generated) for these feedbacks
        let allFeedbackItems = [];
        let offset3 = 0;
        const limit3 = 100;

        while (true) {
          const response = await db.listDocuments(
            DB_ID,
            COLLECTION_ID_PRECEPTOR_AI_FEEDBACK_ITEMS,
            [
              Query.equal('feedback_id', feedback_ids),
              Query.limit(limit3),
              Query.offset(offset3),
            ]
          );

          allFeedbackItems.push(...response.documents);
          if (response.documents.length < limit3) break;
          offset3 += limit3;
        }

        const item_ids = allFeedbackItems.map((item) => item.item_id);

        // 4. Get descriptions for those assessment item_ids
        let allItemDescription = [];
        let offset4 = 0;
        const limit4 = 100;

        while (true) {
          const response = await db.listDocuments(
            DB_ID,
            COLLECTION_ID_ASSESSMENT_ITEMS,
            [
              Query.equal('item_id', item_ids),
              Query.limit(limit4),
              Query.offset(offset4),
            ]
          );

          allItemDescription.push(...response.documents);
          if (response.documents.length < limit4) break;
          offset4 += limit4;
        }

        // 5. Create a map of item_id => description
        const itemDescriptionMap = {};
        for (const desc of allItemDescription) {
          itemDescriptionMap[desc.item_id] = desc;
        }

        // 6. Add description into feedback items
        const allFeedbackItemsWithDescriptions = allFeedbackItems.map(
          (item) => ({
            ...item,
            item_details: itemDescriptionMap[item.item_id] || null,
          })
        );

        // 7. Create a map: feedback_id => [items]
        const feedbackItemsMap = {};
        for (const item of allFeedbackItemsWithDescriptions) {
          const feedbackId = item.feedback_id;
          if (!feedbackItemsMap[feedbackId]) {
            feedbackItemsMap[feedbackId] = [];
          }
          feedbackItemsMap[feedbackId].push(item);
        }

        // 8. Get all facilitator reviews linked to feedback
        let allReviewDocuments = [];
        let offset5 = 0;
        const limit5 = 100;

        while (true) {
          const response = await db.listDocuments(
            DB_ID,
            COLLECTION_ID_FACILITATOR_REVIEWS,
            [
              Query.equal('preceptor_feedback_document_id', feedback_ids),
              Query.limit(limit5),
              Query.offset(offset5),
            ]
          );

          allReviewDocuments.push(...response.documents);
          if (response.documents.length < limit5) break;
          offset5 += limit5;
        }

        const review_ids = allReviewDocuments.map((r) => r.$id);

        // 9. Get all facilitator review scores linked to those reviews
        let allReviewScoresDocuments = [];
        let offset6 = 0;
        const limit6 = 100;

        while (true) {
          const response = await db.listDocuments(
            DB_ID,
            COLLECTION_ID_FACILITATOR_REVIEW_SCORES,
            [
              Query.equal('review_id', review_ids),
              Query.limit(limit6),
              Query.offset(offset6),
            ]
          );

          allReviewScoresDocuments.push(...response.documents);
          if (response.documents.length < limit6) break;
          offset6 += limit6;
        }

        // 10. Create a map of review_id => [scores]
        const reviewScoresMap = {};
        for (const score of allReviewScoresDocuments) {
          const reviewId = score.review_id;
          if (!reviewScoresMap[reviewId]) {
            reviewScoresMap[reviewId] = [];
          }
          reviewScoresMap[reviewId].push(score);
        }

        // 11. Create a map: feedback_id => review (including scores)
        const reviewMap = {};
        for (const review of allReviewDocuments) {
          reviewMap[review.preceptor_feedback_document_id] = {
            ...review,
            review_scores: reviewScoresMap[review.$id] || [],
          };
        }

        // 12. Add items + reviews + preceptor name to each feedback
        const feedbacksWithItemsAndReviews = allFeedbackDocuments.map(
          (feedback) => ({
            ...feedback,
            preceptor_name:
              preceptorDetailsMap[feedback.preceptor_id]?.name || 'Unknown',
            ai_feedback_items: feedbackItemsMap[feedback.$id] || [],
            review: reviewMap[feedback.$id] || null,
          })
        );

        // 13. Group feedbacks by student
        const feedbackMap = {};
        for (const feedback of feedbacksWithItemsAndReviews) {
          const studentId = feedback.student_document_id;
          if (!feedbackMap[studentId]) {
            feedbackMap[studentId] = [];
          }
          feedbackMap[studentId].push(feedback);
        }

        // 14. Combine students with their feedback list
        const studentsWithFeedback = allDocuments_students.map((student) => ({
          ...student,
          preceptorFeedbackList: feedbackMap[student.$id] || [],
        }));

        // 15. Return response
        return res.json(studentsWithFeedback);
    }
  }

  // for get all students with all details
  if (req.path === '/facilitator/get/studentsWithAllDetails') {
    switch (req.method) {
      case 'GET':
        const allDocuments_students = [];
        let offset = 0;
        const limit = 100;
        const created_by = req.bodyJson?.created_by;

        // 1. Get all students created by this facilitator
        while (true) {
          const response = await db.listDocuments(
            DB_ID,
            COLLECTION_ID_STUDENTS,
            [
              Query.equal('created_by', created_by),
              Query.limit(limit),
              Query.offset(offset),
            ]
          );

          allDocuments_students.push(...response.documents);
          if (response.documents.length < limit) break;
          offset += limit;
        }

        const student_document_ids = allDocuments_students.map(
          (student) => student.$id
        );

        // If no students found, return empty array
        if (student_document_ids.length === 0) {
          return res.json([]);
        }

        // 2. Get all feedbacks for these students
        let allFeedbackDocuments = [];
        let offset2 = 0;
        const limit2 = 100;

        while (true) {
          const response = await db.listDocuments(
            DB_ID,
            COLLECTION_ID_PRECEPTOR_FEEDBACKS,
            [
              Query.equal('student_document_id', student_document_ids),
              Query.limit(limit2),
              Query.offset(offset2),
            ]
          );

          allFeedbackDocuments.push(...response.documents);
          if (response.documents.length < limit2) break;
          offset2 += limit2;
        }

        const feedback_ids = allFeedbackDocuments.map((f) => f.$id);

        // 2.5. Get Preceptor Details
        const preceptor_ids = [
          ...new Set(allFeedbackDocuments.map((p) => p.preceptor_id)),
        ];

        const preceptorDetailsMap = {};

        for (const preceptor_id of preceptor_ids) {
          try {
            const preceptor = await users.get(preceptor_id);
            preceptorDetailsMap[preceptor_id] = preceptor;
          } catch (error) {
            console.error(`Failed to get preceptor ${preceptor_id}`, error);
            preceptorDetailsMap[preceptor_id] = null;
          }
        }

        // 3. Get all feedback items (AI-generated) for these feedbacks
        let allFeedbackItems = [];
        if (feedback_ids.length > 0) {
          let offset3 = 0;
          const limit3 = 100;

          while (true) {
            const response = await db.listDocuments(
              DB_ID,
              COLLECTION_ID_PRECEPTOR_AI_FEEDBACK_ITEMS,
              [
                Query.equal('feedback_id', feedback_ids),
                Query.limit(limit3),
                Query.offset(offset3),
              ]
            );

            allFeedbackItems.push(...response.documents);
            if (response.documents.length < limit3) break;
            offset3 += limit3;
          }
        }

        const item_ids = allFeedbackItems.map((item) => item.item_id);

        // 4. Get descriptions for those assessment item_ids
        let allItemDescription = [];
        if (item_ids.length > 0) {
          let offset4 = 0;
          const limit4 = 100;

          while (true) {
            const response = await db.listDocuments(
              DB_ID,
              COLLECTION_ID_ASSESSMENT_ITEMS,
              [
                Query.equal('item_id', item_ids),
                Query.limit(limit4),
                Query.offset(offset4),
              ]
            );

            allItemDescription.push(...response.documents);
            if (response.documents.length < limit4) break;
            offset4 += limit4;
          }
        }

        // 5. Create a map of item_id => description
        const itemDescriptionMap = {};
        for (const desc of allItemDescription) {
          itemDescriptionMap[desc.item_id] = desc;
        }

        // 6. Add description into feedback items
        const allFeedbackItemsWithDescriptions = allFeedbackItems.map(
          (item) => ({
            ...item,
            item_details: itemDescriptionMap[item.item_id] || null,
          })
        );

        // 7. Create a map: feedback_id => [items]
        const feedbackItemsMap = {};
        for (const item of allFeedbackItemsWithDescriptions) {
          const feedbackId = item.feedback_id;
          if (!feedbackItemsMap[feedbackId]) {
            feedbackItemsMap[feedbackId] = [];
          }
          feedbackItemsMap[feedbackId].push(item);
        }

        // 8. Get all facilitator reviews linked to feedback
        let allReviewDocuments = [];
        if (feedback_ids.length > 0) {
          let offset5 = 0;
          const limit5 = 100;

          while (true) {
            const response = await db.listDocuments(
              DB_ID,
              COLLECTION_ID_FACILITATOR_REVIEWS,
              [
                Query.equal('preceptor_feedback_document_id', feedback_ids),
                Query.limit(limit5),
                Query.offset(offset5),
              ]
            );

            allReviewDocuments.push(...response.documents);
            if (response.documents.length < limit5) break;
            offset5 += limit5;
          }
        }

        const review_ids = allReviewDocuments.map((r) => r.$id);

        // 9. Get all facilitator review scores linked to those reviews
        let allReviewScoresDocuments = [];
        if (review_ids.length > 0) {
          let offset6 = 0;
          const limit6 = 100;

          while (true) {
            const response = await db.listDocuments(
              DB_ID,
              COLLECTION_ID_FACILITATOR_REVIEW_SCORES,
              [
                Query.equal('review_id', review_ids),
                Query.limit(limit6),
                Query.offset(offset6),
              ]
            );

            allReviewScoresDocuments.push(...response.documents);
            if (response.documents.length < limit6) break;
            offset6 += limit6;
          }
        }

        // 10. Create a map of review_id => [scores]
        const reviewScoresMap = {};
        for (const score of allReviewScoresDocuments) {
          const reviewId = score.review_id;
          if (!reviewScoresMap[reviewId]) {
            reviewScoresMap[reviewId] = [];
          }
          reviewScoresMap[reviewId].push(score);
        }

        // 11. Create a map: feedback_id => review (including scores)
        const reviewMap = {};
        for (const review of allReviewDocuments) {
          reviewMap[review.preceptor_feedback_document_id] = {
            ...review,
            review_scores: reviewScoresMap[review.$id] || [],
          };
        }

        // 12. Add items + reviews + preceptor name to each feedback
        const feedbacksWithItemsAndReviews = allFeedbackDocuments.map(
          (feedback) => ({
            ...feedback,
            preceptor_name:
              preceptorDetailsMap[feedback.preceptor_id]?.name || 'Unknown',
            ai_feedback_items: feedbackItemsMap[feedback.$id] || [],
            review: reviewMap[feedback.$id] || null,
          })
        );

        // 13. Group feedbacks by student
        const feedbackMap = {};
        for (const feedback of feedbacksWithItemsAndReviews) {
          const studentId = feedback.student_document_id;
          if (!feedbackMap[studentId]) {
            feedbackMap[studentId] = [];
          }
          feedbackMap[studentId].push(feedback);
        }

        // 14. Combine students with their feedback list
        const studentsWithFeedback = allDocuments_students.map((student) => ({
          ...student,
          preceptorFeedbackList: feedbackMap[student.$id] || [],
        }));

        // 15. Return response
        return res.json(studentsWithFeedback);
    }
  }

  // post facilitator comments
  if (req.path === '/facilitator/post/studentReview') {
    switch (req.method) {
      case 'POST':
        try {
          log(req);
          // const { preceptor_feedback_document_id } = JSON.parse(req.body);
          // log(preceptor_feedback_document_id);
          const {
            preceptor_feedback_document_id,
            facilitator_id,
            comment,
            flag_discussed_with_student,
            discussion_date,
            ratedItems,
          } = JSON.parse(req.bodyRaw);

          const response_postReview = await db.createDocument(
            DB_ID,
            COLLECTION_ID_FACILITATOR_REVIEWS,
            ID.unique(),
            {
              preceptor_feedback_document_id,
              facilitator_id,
              comment,
              flag_discussed_with_student,
              discussion_date,
            }
          );

          log(response_postReview);
          const review_id = response_postReview.$id;
          log(review_id);

          // const response_postReviewScore = await db.createDocument(
          //   DB_ID,
          //   COLLECTION_ID_FACILITATOR_REVIEW_SCORES,
          //   ID.unique(),
          //   {
          //     review_id,
          //     item_id,
          //     score,
          //   }
          // )

          // log(response_postReviewScore);

          await Promise.all(
            ratedItems.map(({ itemId, rating }) =>
              db
                .createDocument(
                  DB_ID,
                  COLLECTION_ID_FACILITATOR_REVIEW_SCORES,
                  ID.unique(),
                  {
                    review_id,
                    item_id: itemId,
                    score: rating,
                  }
                )
                .then(log)
            )
          );

          return res.json({ message: 'Post comment successfully' });
        } catch (error) {
          log('Post error:', error);
          return res.json({ message: 'Failed to post', error });
        }
    }
  }

  // update notification as read
  if (req.path === '/facilitator/notification/put') {
    switch (req.method) {
      case 'PUT':
        const doc_id = req.bodyJson?.doc_id;

        await db.updateDocument(DB_ID, COLLECTION_ID_NOTIFICATIONS, doc_id, {
          is_read: true,
        });

        return res.json({
          // message: response_upDateNotification,
          // doc_id: doc_id,
          message: 'update successfully',
        });
    }
  }

  // AI Summary
  // const groq = new Groq({ apiKey: GROQ_API_KEY });

  // async function getGroqChatCompletion(prompt) {
  //   return groq.chat.completions.create({
  //     messages: [{ role: 'user', content: prompt }],
  //     model: 'llama-3.3-70b-versatile',
  //   });
  // }

  // if (req.path === '/facilitator/AIsummary') {
  //   switch (req.method) {
  //     case 'POST':
  //       const prompt = req.bodyJson?.prompt;
  //       try {
  //         const chatCompletion = await getGroqChatCompletion(prompt);

  //         return res.json({
  //           message: 'Generate AI Summary Successfully',
  //           aiAnswer:
  //             chatCompletion.choices[0]?.message?.content || 'No AI answer',
  //         });
  //       } catch (error) {
  //         console.error('Groq error:', error);
  //         return res.json({ error: error.message || 'Unknown error' });
  //       }

  //   }
  // }

  // AI Summary 1
  const groq = new Groq({ apiKey: GROQ_API_KEY });

  async function getGroqChatCompletion(prompt) {
    return groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
    });
  }

  // Process incoming requests
  if (req.path === '/facilitator/AIsummary') {
    switch (req.method) {
      case 'POST':
        const prompt = req.bodyJson?.prompt; // Array of feedback prompts

        // Prepare structured input to AI model
        const aiPrompt = createAIPrompt(prompt);

        try {
          // Get AI summary based on prompt
          const chatCompletion = await getGroqChatCompletion(aiPrompt);

          return res.json({
            message: 'Generate AI Summary Successfully',
            aiAnswer:
              chatCompletion.choices[0]?.message?.content || 'No AI answer',
          });
        } catch (error) {
          console.error('Groq error:', error);
          return res.json({ error: error.message || 'Unknown error' });
        }
    }
  }

  // Function to generate the structured AI prompt
  function createAIPrompt(feedbackData) {
    const studentName = 'This student';

    // Combine all feedback content
    let feedbackContent = feedbackData
      .map((item, index) => {
        return `
      ### Feedback Report ${index + 1}
      **Content**: ${item.content}
      **Review Comment**: ${item.reviewComment}
      **Review Score**: ${item.reviewScore.map((score) => `Description: ${score.description}, Score: ${score.score}`).join('\n')}
    `;
      })
      .join('\n');

    // Construct AI prompt
    return `
    Based on the following feedback reports for ${studentName}, generate a performance summary with the following sections:
    - Key Strengths
    - Areas for Improvement
    - Overall Progress
    - Recommendations

    Feedback:
    ${feedbackContent}

    Provide the summary with bullet points for each section. The AI should focus on the key themes from the feedback and generate the sections in a natural, helpful way. Do not include any specific scores, only focus on key themes from the content and review comments. Do not include title "Performance for"
  `;
  }

  // Make all the users verified
  if (req.path === '/admin/verifyAllUsers') {
    switch (req.method) {
      case 'PUT':
        let allUsers = [];
        let page = 0;
        const limit = 100;

        while (true) {
          const response = await users.list([
            Query.limit(limit),
            Query.offset(page * limit),
          ]);
          allUsers = allUsers.concat(response.users);

          if (response.users.length < limit) break;
          page++;
        }

        await Promise.all(
          allUsers.map((user) => users.updateEmailVerification(user.$id, true))
        );

        return res.json({
          message: `All ${allUsers.length} users have been verified.`,
        });
    }
  }
};
