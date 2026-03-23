import { useState } from 'react';
import PersonForm from '../components/PersonForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FormPage = () => {
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/api/people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 409) {
            throw new Error('Email already exists');
        }
        throw new Error(data.error || 'Failed to add person');
      }
      
      setMessage({ text: 'Person added successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  return (
    <div>
      <h2>Add New Person</h2>
      {message.text && (
        <div className={message.type === 'error' ? 'error' : 'success'}>
          {message.text}
        </div>
      )}
      <PersonForm onSubmit={handleSubmit} isEditing={false} />
    </div>
  );
};

export default FormPage;
