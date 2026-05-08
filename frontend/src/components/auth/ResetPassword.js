import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
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
  IconButton,
  InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import api from '../../services/api';

const ContainerStyled = styled(Container)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f4f6f9'
});

const PaperStyled = styled(Paper)({
  padding: '40px',
  width: '100%',
  maxWidth: '400px',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
      validateToken(tokenParam);
    } else {
      setError('Token de réinitialisation manquant');
      setValidating(false);
    }
  }, [location]);

  const validateToken = async (token) => {
    try {
      const response = await api.get(`/auth/validate-reset-token?token=${token}`);
      if (!response.data.valid) {
        setError('Ce lien de réinitialisation est invalide ou a expiré');
      }
    } catch (err) {
      setError('Erreur de validation du token');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <ContainerStyled>
        <PaperStyled elevation={0}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Validation du lien...</Typography>
          </Box>
        </PaperStyled>
      </ContainerStyled>
    );
  }

  return (
    <ContainerStyled>
      <PaperStyled elevation={0}>
        <Box sx={{ mb: 3 }}>
          <Link
            component={RouterLink}
            to="/login"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: '#7f8c8d',
              textDecoration: 'none',
              '&:hover': { color: '#e67e22' }
            }}
          >
            <ArrowBackIcon sx={{ mr: 1, fontSize: 18 }} />
            Retour à la connexion
          </Link>
        </Box>

        <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', color: '#2c3e50' }}>
          Nouveau mot de passe
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            Mot de passe réinitialisé avec succès! Redirection vers la page de connexion...
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              placeholder="Nouveau mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading || error}
              required
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              placeholder="Confirmer le mot de passe"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || error}
              required
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !newPassword || !confirmPassword}
              sx={{
                bgcolor: '#e67e22',
                color: 'white',
                padding: '12px',
                '&:hover': { bgcolor: '#d35400' }
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Réinitialiser le mot de passe'}
            </Button>
          </form>
        )}
      </PaperStyled>
    </ContainerStyled>
  );
};

export default ResetPassword;