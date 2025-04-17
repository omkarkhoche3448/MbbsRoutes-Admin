import React, { useState, useEffect } from 'react';
import { useFetchStudents } from '../services/api';
import StudentTable from './StudentTable';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchStudents = useFetchStudents();

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const data = await fetchStudents();
        setStudents(data);
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

  return <StudentTable students={students} />;
};

export default StudentsPage;