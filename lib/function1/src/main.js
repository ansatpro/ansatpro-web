import { Client, Databases, ID, Users, Query } from 'node-appwrite';

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {

  const project_API_key = process.env.project_API_key;

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(project_API_key);
  const users = new Users(client);

  const DB_ID = process.env.db_id;
  const COLLECTION_ID_STUDENTS = process.env.collection_id_students;
  const COLLECTION_ID_EMAIL_VERIFICATION_TOKENS =process.env.email_verification_tokens;
  const COLLECTION_ID_NOTIFICATIONS = process.env.notifications;


  const db = new Databases(client);

  try {
    const response = await users.list();
    // Log messages and errors to the Appwrite Console
    // These logs won't be seen by your end users
    log(`Total users: ${response.total}`);
  } catch (err) {
    error('Could not list users: ' + err.message);
  }

  // basic connection
  if (req.path === '/ping') {
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
};
