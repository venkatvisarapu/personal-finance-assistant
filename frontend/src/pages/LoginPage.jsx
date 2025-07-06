import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

// this page is used for logging in the user
function LoginPage() {
  // form input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // error message if login fails
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth(); // from context

  // when user submits the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', { email, password });
      login(data); // store in localStorage and context
      navigate('/'); // go to dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="card">
          <h1>Login</h1>

          {/* show error message if login fails */}
          {error && <p className="upload-status failed">{error}</p>}

          <form onSubmit={handleSubmit}>
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
              Login
            </button>
          </form>

          <p className="auth-link">
            New User? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
