import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Navigate } from 'react-router-dom';
import userService from '../../services/user.service';
import api from '../../services/api';
import useRole from '../../hooks/useRole';

const UserList = () => {
  const { isAdmin } = useRole();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    roleId: '',
    active: true
  });

  // Tous les Hooks avant le return conditionnel
  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadRoles();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await api.get('/setup/check');
      setRoles(response.data.roles);
    } catch (err) {
      console.error('Erreur chargement rôles:', err);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      await userService.deleteUser(userToDelete.id);
      setSuccess(`Utilisateur "${userToDelete.fullName}" supprimé avec succès`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        password: '',
        roleId: user.role?.id || '',
        active: user.active
      });
    } else {
      setEditingUser(null);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        roleId: '',
        active: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      roleId: '',
      active: true
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: { id: parseInt(formData.roleId) },
        active: formData.active
      };
      
      if (editingUser) {
        await userService.updateUser(editingUser.id, userData);
        setSuccess(`Utilisateur "${formData.fullName}" modifié avec succès`);
      } else {
        await userService.createUser(userData);
        setSuccess(`Utilisateur "${formData.fullName}" créé avec succès`);
      }
      handleCloseDialog();
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement');
    }
  };

  const getRoleChip = (roleName) => {
    const roleColors = {
      'ADMIN': 'error',
      'TECHNICIEN': 'warning',
      'CONSULTATION': 'info'
    };
    return <Chip size="small" color={roleColors[roleName] || 'default'} label={roleName} />;
  };

  // Return conditionnel APRÈS tous les Hooks
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestion des Utilisateurs</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#e67e22', '&:hover': { bgcolor: '#d35400' } }}
        >
          Nouvel utilisateur
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Nom complet</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date création</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleChip(user.role?.name)}</TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      color={user.active ? 'success' : 'default'} 
                      label={user.active ? 'Actif' : 'Inactif'} 
                    />
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleOpenDialog(user)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteClick(user)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom complet"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={editingUser ? "Nouveau mot de passe (laisser vide pour ne pas modifier)" : "Mot de passe"}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required={!editingUser}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Rôle</InputLabel>
                <Select
                  name="roleId"
                  value={formData.roleId}
                  label="Rôle"
                  onChange={handleChange}
                >
                  {roles.map(role => (
                    <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  name="active"
                  value={formData.active}
                  label="Statut"
                  onChange={handleChange}
                >
                  <MenuItem value={true}>Actif</MenuItem>
                  <MenuItem value={false}>Inactif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.fullName || !formData.email || (!editingUser && !formData.password) || !formData.roleId}
            sx={{ bgcolor: '#e67e22', '&:hover': { bgcolor: '#d35400' } }}
          >
            {editingUser ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>"{userToDelete?.fullName}"</strong> ?
            <br />
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserList;