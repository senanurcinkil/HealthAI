import { useState, useEffect } from 'react';
import PeopleTable from '../components/PeopleTable';
import PersonForm from '../components/PersonForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PeopleListPage = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingPerson, setEditingPerson] = useState(null);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/people`);
      if (!res.ok) throw new Error('Failed to fetch people');
      const data = await res.json();
      setPeople(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this person?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/people/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      setSuccess('Person deleted successfully.');
      setError('');
      fetchPeople();
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  const handleEdit = (person) => {
    setEditingPerson(person);
    setError('');
    setSuccess('');
  };

  const handleUpdate = async (formData) => {
    try {
      const res = await fetch(`${API_URL}/api/people/${editingPerson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 409) throw new Error('Email already exists');
        throw new Error(data.error || 'Failed to update person');
      }
      
      setSuccess('Person updated successfully.');
      setError('');
      setEditingPerson(null);
      fetchPeople();
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  return (
    <div>
      <h2>People List</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {editingPerson ? (
        <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h3>Edit Person</h3>
          <PersonForm 
            initialData={editingPerson} 
            onSubmit={handleUpdate} 
            isEditing={true} 
          />
          <button style={{ marginTop: '10px' }} onClick={() => setEditingPerson(null)}>Cancel Edit</button>
        </div>
      ) : null}

      {loading ? <p>Loading...</p> : <PeopleTable people={people} onEdit={handleEdit} onDelete={handleDelete} />}
    </div>
  );
};

export default PeopleListPage;
