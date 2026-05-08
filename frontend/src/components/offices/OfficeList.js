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
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Navigate } from 'react-router-dom';
import api from '../../services/api';
import useRole from '../../hooks/useRole';

const OfficeList = () => {
  const { isAdmin } = useRole();
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [officeToDelete, setOfficeToDelete] = useState(null);
  const [editingOffice, setEditingOffice] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    floor: '',
    building: '',
    site: ''
  });

  useEffect(() => {
    if (isAdmin) {
      loadOffices();
    }
  }, [isAdmin]);

  const loadOffices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/offices');
      setOffices(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des bureaux');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (office) => {
    setOfficeToDelete(office);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!officeToDelete) return;
    
    try {
      await api.delete(`/offices/${officeToDelete.id}`);
      setSuccess(`Bureau "${officeToDelete.name}" supprimé avec succès`);
      setDeleteDialogOpen(false);
      setOfficeToDelete(null);
      loadOffices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const handleOpenDialog = (office = null) => {
    if (office) {
      setEditingOffice(office);
      setFormData({
        name: office.name || '',
        floor: office.floor || '',
        building: office.building || '',
        site: office.site || ''
      });
    } else {
      setEditingOffice(null);
      setFormData({ name: '', floor: '', building: '', site: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingOffice(null);
    setFormData({ name: '', floor: '', building: '', site: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (editingOffice) {
        await api.put(`/offices/${editingOffice.id}`, formData);
        setSuccess(`Bureau "${formData.name}" modifié avec succès`);
      } else {
        await api.post('/offices', formData);
        setSuccess(`Bureau "${formData.name}" créé avec succès`);
      }
      handleCloseDialog();
      loadOffices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement');
    }
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
        <Typography variant="h4">Gestion des Bureaux</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#e67e22', '&:hover': { bgcolor: '#d35400' } }}
        >
          Nouveau bureau
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Étage</TableCell>
              <TableCell>Bâtiment</TableCell>
              <TableCell>Site</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {offices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Aucun bureau trouvé
                </TableCell>
              </TableRow>
            ) : (
              offices.map((office) => (
                <TableRow key={office.id} hover>
                  <TableCell>{office.name}</TableCell>
                  <TableCell>{office.floor || '-'}</TableCell>
                  <TableCell>{office.building || '-'}</TableCell>
                  <TableCell>{office.site || '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleOpenDialog(office)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteClick(office)}>
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
          {editingOffice ? 'Modifier le bureau' : 'Ajouter un bureau'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom du bureau"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Étage"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bâtiment"
                name="building"
                value={formData.building}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Site"
                name="site"
                value={formData.site}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name}
            sx={{ bgcolor: '#e67e22', '&:hover': { bgcolor: '#d35400' } }}
          >
            {editingOffice ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer le bureau <strong>"{officeToDelete?.name}"</strong> ?
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

export default OfficeList;