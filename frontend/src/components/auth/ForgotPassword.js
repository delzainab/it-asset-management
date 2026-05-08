import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

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
          Mot de passe oublié ?
        </Typography>

        <Typography sx={{ mb: 3, textAlign: 'center', color: '#7f8c8d', fontSize: '14px' }}>
          Entrez votre email pour recevoir un lien de réinitialisation
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            Si votre email existe, vous recevrez un lien de réinitialisation.
            Vérifiez votre boîte de réception.
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              placeholder="Votre adresse email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !email}
              sx={{
                bgcolor: '#e67e22',
                color: 'white',
                padding: '12px',
                '&:hover': { bgcolor: '#d35400' },
                '&:disabled': { bgcolor: '#f39c12' }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Envoyer le lien'}
            </Button>
          </form>
        )}
      </PaperStyled>
    </ContainerStyled>
  );
};

export default ForgotPassword;