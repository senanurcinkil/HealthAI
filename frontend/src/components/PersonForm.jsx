import { useState, useEffect } from 'react';

const PersonForm = ({ initialData, onSubmit, isEditing }) => {
  const [formData, setFormData] = useState({ full_name: '', email: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validate = () => {
    if (!formData.full_name) return 'Full name is required';
    if (!formData.email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Invalid email format';
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <div>
        <label>Full Name:</label>
        <input 
          type="text" 
          value={formData.full_name} 
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        />
      </div>
      
      <div>
        <label>Email:</label>
        <input 
          type="email" 
          value={formData.email} 
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      
      <button type="submit">{isEditing ? 'Update Person' : 'Add Person'}</button>
    </form>
  );
};

export default PersonForm;
