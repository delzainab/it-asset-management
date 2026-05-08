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
  Chip,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useRole from '../../hooks/useRole';

const MaintenanceList = () => {
  const navigate = useNavigate();
  const { isAdmin, isTechnician } = useRole();
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({
    assetId: '',
    type: 'PREVENTIVE',
    problemDescription: '',
    actionsPerformed: '',
    interventionDate: new Date().toISOString().split('T')[0],
    duration: '',
    cost: '',
    provider: ''
  });

  useEffect(() => {
    loadMaintenances();
    loadAssets();
  }, []);

  const loadMaintenances = async () => {
    try {
      setLoading(true);
      const response = await api.get('/maintenances/all');
      setMaintenances(response.data);
    } catch (err) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadAssets = async () => {
    try {
      const response = await api.get('/assets');
      setAssets(response.data);
    } catch (err) {
      console.error('Erreur chargement assets:', err);
    }
  };

  const handleOpenDialog = (maintenance = null) => {
    if (maintenance) {
      setEditingMaintenance(maintenance);
      setFormData({
        assetId: maintenance.asset?.id || '',
        type: maintenance.type || 'PREVENTIVE',
        problemDescription: maintenance.problemDescription || '',
        actionsPerformed: maintenance.actionsPerformed || '',
        interventionDate: maintenance.interventionDate ? maintenance.interventionDate.split('T')[0] : new Date().toISOString().split('T')[0],
        duration: maintenance.duration || '',
        cost: maintenance.cost || '',
        provider: maintenance.provider || ''
      });
    } else {
      setEditingMaintenance(null);
      setFormData({
        assetId: '',
        type: 'PREVENTIVE',
        problemDescription: '',
        actionsPerformed: '',
        interventionDate: new Date().toISOString().split('T')[0],
        duration: '',
        cost: '',
        provider: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMaintenance(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (editingMaintenance) {
        await api.put(`/maintenances/${editingMaintenance.id}`, formData);
        setSuccess('Maintenance modifiée avec succès');
      } else {
        await api.post('/maintenances', formData);
        setSuccess('Maintenance créée avec succès');
      }
      handleCloseDialog();
      loadMaintenances();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id, assetName) => {
    if (window.confirm(`Supprimer la maintenance pour "${assetName}" ?`)) {
      try {
        await api.delete(`/maintenances/${id}`);
        setSuccess('Maintenance supprimée');
        loadMaintenances();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  const getTypeChip = (type) => {
    const colors = { PREVENTIVE: 'info', CORRECTIVE: 'warning' };
    const labels = { PREVENTIVE: 'Préventive', CORRECTIVE: 'Corrective' };
    return <Chip size="small" color={colors[type] || 'default'} label={labels[type] || type} />;
  };

  const getStatusChip = (status) => {
    const colors = { PLANIFIE: 'default', EN_COURS: 'warning', TERMINE: 'success' };
    const labels = { PLANIFIE: 'Planifiée', EN_COURS: 'En cours', TERMINE: 'Terminée' };
    return <Chip size="small" color={colors[status] || 'default'} label={labels[status] || status} />;
  };

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
        <Typography variant="h4">Gestion des Maintenances</Typography>
        {(isAdmin || isTechnician) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: '#e67e22' }}
          >
            Nouvelle maintenance
          </Button>
        )}
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Matériel</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Problème</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Durée</TableCell>
              <TableCell>Coût</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {maintenances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Aucune maintenance trouvée
                </TableCell>
              </TableRow>
            ) : (
              maintenances.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell>
                    {m.asset?.type} - {m.asset?.brand} {m.asset?.model}
                  </TableCell>
                  <TableCell>{getTypeChip(m.type)}</TableCell>
                  <TableCell>{m.problemDescription?.substring(0, 50)}...</TableCell>
                  <TableCell>
                    {m.interventionDate ? new Date(m.interventionDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>{m.duration ? `${m.duration} h` : '-'}</TableCell>
                  <TableCell>{m.cost ? `${m.cost} DH` : '-'}</TableCell>
                  <TableCell>{getStatusChip(m.status)}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => navigate(`/maintenances/${m.id}`)} title="Voir">
                      <ViewIcon />
                    </IconButton>
                    {(isAdmin || isTechnician) && (
                      <>
                        <IconButton onClick={() => handleOpenDialog(m)} title="Modifier">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(m.id, `${m.asset?.type} - ${m.asset?.brand}`)} title="Supprimer">
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog d'ajout/modification */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMaintenance ? 'Modifier la maintenance' : 'Nouvelle maintenance'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Matériel</InputLabel>
                <Select
                  name="assetId"
                  value={formData.assetId}
                  label="Matériel"
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="">-- Sélectionner --</MenuItem>
                  {assets.map(asset => (
                    <MenuItem key={asset.id} value={asset.id}>
                      {asset.type} - {asset.brand} {asset.model} ({asset.serialNumber})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  label="Type"
                  onChange={handleChange}
                >
                  <MenuItem value="PREVENTIVE">Préventive</MenuItem>
                  <MenuItem value="CORRECTIVE">Corrective</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description du problème"
                name="problemDescription"
                multiline
                rows={3}
                value={formData.problemDescription}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Actions réalisées"
                name="actionsPerformed"
                multiline
                rows={3}
                value={formData.actionsPerformed}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date d'intervention"
                name="interventionDate"
                type="date"
                value={formData.interventionDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Durée (heures)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Coût (DH)"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Prestataire"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.assetId}>
            {editingMaintenance ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaintenanceList;