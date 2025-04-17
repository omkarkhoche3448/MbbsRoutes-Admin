import React, { useState, useEffect } from 'react';
import { useFetchStudents } from '../services/api';
import StudentTable from './StudentTable';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [districts, setDistricts] = useState([]);
  const fetchStudents = useFetchStudents();

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const data = await fetchStudents();
        
        // Extract unique districts from student data
        const uniqueDistricts = [...new Set(data.map(student => student.district).filter(Boolean))];
        setDistricts(uniqueDistricts);
        
        setStudents(data.map(student => ({
          ...student,
          // Ensure all required fields are present
          district: student.district || 'Not Specified',
          interestedIn: student.interestedIn || 'MBBS From Abroad',
          neetScore: student.neetScore || '',
          preferredCountry: student.preferredCountry || 'Not Specified',
          preferredCounsellor: student.preferredCounsellor || 'Not Assigned'
        })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [fetchStudents]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <StudentTable students={students} districts={districts} />;
};

export default StudentsPage;