import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import api from '../../services/api';
import useRole from '../../hooks/useRole';

const MaintenanceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin, isTechnician } = useRole();
  const isEditMode = !!id;

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

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAssets();
    if (isEditMode) {
      loadMaintenance();
    }
  }, [isEditMode]);

  const loadAssets = async () => {
    try {
      const response = await api.get('/assets');
      setAssets(response.data);
    } catch (err) {
      console.error('Erreur chargement assets:', err);
    }
  };

  const loadMaintenance = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/maintenances/${id}`);
      const data = response.data;
      setFormData({
        assetId: data.asset?.id || '',
        type: data.type || 'PREVENTIVE',
        problemDescription: data.problemDescription || '',
        actionsPerformed: data.actionsPerformed || '',
        interventionDate: data.interventionDate ? data.interventionDate.split('T')[0] : new Date().toISOString().split('T')[0],
        duration: data.duration || '',
        cost: data.cost || '',
        provider: data.provider || ''
      });
    } catch (err) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (isEditMode) {
        await api.put(`/maintenances/${id}`, formData);
        setSuccess('Maintenance modifiée avec succès');
      } else {
        await api.post('/maintenances', formData);
        setSuccess('Maintenance créée avec succès');
        if (!isEditMode) {
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
      }
      setTimeout(() => {
        navigate('/maintenances');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
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
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/maintenances')}
        sx={{ mb: 2 }}
      >
        Retour à la liste
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {isEditMode ? 'Modifier la maintenance' : 'Nouvelle maintenance'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Matériel</InputLabel>
                <Select
                  name="assetId"
                  value={formData.assetId}
                  label="Matériel"
                  onChange={handleChange}
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
              <FormControl fullWidth required>
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

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate('/maintenances')}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saving || !formData.assetId}
                  sx={{ bgcolor: '#e67e22' }}
                >
                  {saving ? <CircularProgress size={24} /> : (isEditMode ? 'Modifier' : 'Créer')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default MaintenanceForm;