import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

// this page is used for registering new users
function RegisterPage() {
  // form input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // to show error if something goes wrong
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth(); // from context

  // when user submits the register form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // send form data to backend
      const { data } = await API.post('/auth/register', {
        name,
        email,
        password,
      });

      // log the user in immediately after register
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="card">
          <h1>Register</h1>

          {/* error message block */}
          {error && <p className="upload-status failed">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Register
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
