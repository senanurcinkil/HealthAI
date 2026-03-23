import React from 'react';

const PeopleTable = ({ people, onEdit, onDelete }) => {
  if (people.length === 0) {
    return <p>No people found.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Full Name</th>
          <th>Email</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {people.map(person => (
          <tr key={person.id}>
            <td>{person.id}</td>
            <td>{person.full_name}</td>
            <td>{person.email}</td>
            <td>
              <button className="edit-btn" onClick={() => onEdit(person)}>Edit</button>
              <button className="danger-btn" onClick={() => onDelete(person.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PeopleTable;
