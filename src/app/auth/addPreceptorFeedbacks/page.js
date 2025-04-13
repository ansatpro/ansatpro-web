"use client";

import { useState, useEffect } from 'react';
import { account, functions } from "../../appwrite";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function PreceptorFeedbackForm() {
    const [user, setUser] = useState(null);
    const [jwt, setJwt] = useState('');
    const [content, setContent] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [flagFacilitator, setFlagFacilitator] = useState(false);
    const [flagStudent, setFlagStudent] = useState(false);
    const [discussionDate, setDiscussionDate] = useState('');
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await account.get();
                const jwtRes = await account.createJWT();
                setUser(currentUser);
                setJwt(jwtRes.jwt);
            } catch (err) {
                console.error('Auth error', err);
            }
        };
        loadUser();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Submitting...');

        try {
            const payload = {
                student_id: selectedStudentId,
                preceptor_id: user.$id,
                content,
                flag_discuss_with_facilitator: flagFacilitator,
                flag_discussed_with_student: flagStudent,
                discussion_date: discussionDate, // manually picked by user
            };

            const execution = await functions.createExecution(
                'function_jwt_require',
                JSON.stringify({
                    jwt,
                    action: 'addPreceptorFeedback',
                    payload
                })
            );

            const result = JSON.parse(execution.responseBody);

            if (result.status === 'success') {
                setStatus('✅ Feedback submitted successfully.');
            } else {
                setStatus(`❌ Failed: ${result.message}`);
            }
        } catch (err) {
            console.error(err);
            setStatus('❌ Submission failed.');
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10 p-4 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Submit Feedback for Student</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                    <Label htmlFor="studentId">Select Student</Label>
                    <Input
                        type="text"
                        id="studentId"
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        required
                        placeholder="Enter student ID"
                    />
                </div>

                <div>
                    <Label>Content</Label>
                    <Input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        placeholder="Enter feedback"
                    />
                </div>

                <div>
                    <Label>Discussion Date</Label>
                    <Input
                        type="date"
                        value={discussionDate}
                        onChange={(e) => setDiscussionDate(e.target.value)}
                        required
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Input
                        type="checkbox"
                        id="flagFacilitator"
                        checked={flagFacilitator}
                        onChange={(e) => setFlagFacilitator(e.target.checked)}
                    />
                    <Label htmlFor="flagFacilitator">Flag: Discuss with facilitator</Label>
                </div>

                <div className="flex items-center space-x-2">
                    <Input
                        type="checkbox"
                        id="flagStudent"
                        checked={flagStudent}
                        onChange={(e) => setFlagStudent(e.target.checked)}
                    />
                    <Label htmlFor="flagStudent">Flag: Discussed with student</Label>
                </div>

                <Button type="submit" className="mt-2 w-full">Submit Feedback</Button>

                {status && <p className="text-sm text-gray-600 mt-4">{status}</p>}
            </form>
        </div>
    );
}
