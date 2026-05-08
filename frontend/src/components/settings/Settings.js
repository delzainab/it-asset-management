import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person as PersonIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import useRole from '../../hooks/useRole';
import userService from '../../services/user.service';

const Settings = () => {
  const { user, logout } = useAuth();
  const { isAdmin } = useRole();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || ''
  });

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  const handleProfileUpdate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const userData = {
        fullName: profileData.fullName,
        email: profileData.email,
        active: true,
        role: user?.role ? { id: user.role.id } : null
      };
      
      await userService.updateUser(user.id, userData);
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currentUser,
        fullName: profileData.fullName,
        email: profileData.email
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccess('Profil mis à jour avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await userService.updateUser(user.id, {
        password: passwordData.newPassword
      });
      
      setSuccess('Mot de passe modifié avec succès');
      setOpenPasswordDialog(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Paramètres
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: '#e67e22', mb: 2, fontSize: 32 }}>
                  {user?.fullName?.charAt(0) || 'U'}
                </Avatar>
                <Typography variant="h6">{user?.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Rôle: {user?.roles?.[0] || user?.role?.name || 'ADMIN'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper>
            <List>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Profil"
                  secondary={
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Nom complet"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          onClick={() => setOpenPasswordDialog(true)}
                        >
                          Changer le mot de passe
                        </Button>
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleProfileUpdate}
                          disabled={loading}
                          sx={{ bgcolor: '#e67e22', '&:hover': { bgcolor: '#d35400' } }}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Enregistrer les modifications'}
                        </Button>
                      </Grid>
                    </Grid>
                  }
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog changement mot de passe */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Changer le mot de passe</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nouveau mot de passe"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Confirmer le mot de passe"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Annuler</Button>
          <Button onClick={handlePasswordChange} variant="contained" disabled={loading} sx={{ bgcolor: '#e67e22' }}>
            {loading ? <CircularProgress size={24} /> : 'Modifier'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;