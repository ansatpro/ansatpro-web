"use client";

import { useState, useEffect } from "react";
import { account, functions } from "../../appwrite";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function FullStudentTestForm() {
    const [jwt, setJwt] = useState('');
    const [status, setStatus] = useState('');
    const [formData, setFormData] = useState({
        student_id: '',
        first_name: '',
        last_name: '',
        university_id: '',
        health_service_id: '',
        clinic_area_id: '',
        start_date: '',
        end_date: '',
        additional_facilitator_id: ''
    });

    useEffect(() => {
        const init = async () => {
            const session = await account.get();
            const jwtRes = await account.createJWT();
            setJwt(jwtRes.jwt);
        };
        init();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Submitting...');

        const full_name_lower = `${formData.first_name} ${formData.last_name}`.toLowerCase();

        try {
            const result = await functions.createExecution(
                'function_jwt_require',
                JSON.stringify({
                    jwt,
                    action: 'addStudentByFacilitator',
                    payload: {
                        ...formData,
                        full_name_lower
                    }
                })
            );

            const parsed = JSON.parse(result.responseBody);
            if (parsed.status === 'success') {
                setStatus('✅ Student added successfully.');
            } else {
                setStatus(`❌ ${parsed.message}`);
            }
        } catch (err) {
            console.error(err);
            setStatus('❌ Error while submitting.');
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10 p-4 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Test Add Student</h2>
            <form className="space-y-3" onSubmit={handleSubmit}>
                {[
                    "student_id", "first_name", "last_name", "university_id",
                    "health_service_id", "clinic_area_id",
                    "start_date", "end_date", "additional_facilitator_id"
                ].map((field) => (
                    <div key={field}>
                        <Label>{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                        <Input
                            type={field.includes('date') ? 'date' : 'text'}
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                            required={["first_name", "last_name"].includes(field)}
                        />
                    </div>
                ))}
                <Button type="submit" className="w-full">Submit</Button>
                {status && <p className="text-sm mt-2 text-gray-600">{status}</p>}
            </form>
        </div>
    );
}
