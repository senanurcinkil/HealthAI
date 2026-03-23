import { Routes, Route, Link } from 'react-router-dom';
import FormPage from './pages/FormPage';
import PeopleListPage from './pages/PeopleListPage';

function App() {
  return (
    <div className="container">
      <nav>
        <Link to="/">Add Person</Link>
        <Link to="/people">People List</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<FormPage />} />
        <Route path="/people" element={<PeopleListPage />} />
      </Routes>
    </div>
  );
}

export default App;
