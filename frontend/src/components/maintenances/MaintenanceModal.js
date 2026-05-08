import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import maintenanceService from '../../services/maintenance.service';

const MaintenanceModal = ({ open, onClose, assetId, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'PREVENTIVE',
    problemDescription: '',
    actionsPerformed: '',
    interventionDate: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
    duration: '',
    cost: '',
    provider: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const dataToSend = {
        assetId: assetId,
        type: formData.type,
        problemDescription: formData.problemDescription,
        actionsPerformed: formData.actionsPerformed || '',
        interventionDate: formData.interventionDate,
        duration: formData.duration ? parseInt(formData.duration) : null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        provider: formData.provider || ''
      };

      console.log('Envoi des données:', dataToSend);
      
      await maintenanceService.createMaintenance(dataToSend);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'PREVENTIVE',
      problemDescription: '',
      actionsPerformed: '',
      interventionDate: new Date().toISOString().split('T')[0],
      duration: '',
      cost: '',
      provider: ''
    });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Nouvelle maintenance</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
        
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={2}>
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
                placeholder="Décrivez les actions effectuées..."
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Durée (min)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0, step: 0.5 } }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Coût (DH)"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Prestataire"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                placeholder="Service informatique, prestataire externe..."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading || !formData.problemDescription}
          sx={{ bgcolor: '#e67e22', '&:hover': { bgcolor: '#d35400' } }}
        >
          {loading ? <CircularProgress size={24} /> : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaintenanceModal;