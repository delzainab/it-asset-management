import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';

const LoginContainer = styled(Container)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f4f6f9'
});

const LoginPaper = styled(Paper)({
  padding: '40px',
  width: '100%',
  maxWidth: '400px',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
});

const Title = styled(Typography)({
  color: '#2c3e50',
  fontSize: '28px',
  fontWeight: '300',
  marginBottom: '30px',
  textAlign: 'center',
  '& span': {
    color: '#e67e22',
    fontWeight: 'bold'
  }
});

const LoginButton = styled(Button)({
  backgroundColor: '#e67e22',
  color: 'white',
  padding: '12px',
  fontSize: '16px',
  fontWeight: 'bold',
  marginTop: '20px',
  marginBottom: '20px',
  '&:hover': {
    backgroundColor: '#d35400'
  }
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'remember' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.remember) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginPaper elevation={0}>
        <Title>IT <span>Asset Management </span></Title>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            placeholder="Login"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            placeholder="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            required
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Link
              component={RouterLink}
              to="/forgot-password"
              sx={{
                color: '#e67e22',
                textDecoration: 'none',
                fontSize: '14px',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Forgot password?
            </Link>
          </Box>

          <LoginButton
            type="submit"
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Post'}
          </LoginButton>
        </form>

        <Typography textAlign="center" color="#95a5a6" fontSize="12px">
          501 × 35
        </Typography>
      </LoginPaper>
    </LoginContainer>
  );
};

export default Login;