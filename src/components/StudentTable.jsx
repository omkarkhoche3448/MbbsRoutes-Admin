import React from 'react';

const StudentTable = ({ students }) => {
  if (!Array.isArray(students)) {
    console.error('Students prop is not an array:', students);
    return <div>Error: Invalid data format</div>;
  }

  if (students.length === 0) {
    return <div>No students found</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Contact</th>
          <th>State</th>
          <th>Interested In</th>
          <th>Selected Counsellor</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <tr key={student._id}>
            <td>{student.name}</td>
            <td>{student.contact}</td>
            <td>{student.state}</td>
            <td>{student.interestedIn}</td>
            <td>{student.selectedCounsellor || 'Not Assigned'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StudentTable;