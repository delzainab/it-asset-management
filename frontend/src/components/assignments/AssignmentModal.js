import React, { useState, useEffect } from 'react';
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
import api from '../../services/api';

const AssignmentModal = ({ open, onClose, assetId, onSuccess }) => {
  const [type, setType] = useState('user');
  const [userId, setUserId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    if (open) {
      loadUsers();
      loadDepartments();
    }
  }, [open]);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Erreur chargement users:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (err) {
      console.error('Erreur chargement services:', err);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const request = {
        assetId,
        comment
      };

      if (type === 'user') {
        if (!userId) {
          setError('Veuillez sélectionner un utilisateur');
          setLoading(false);
          return;
        }
        request.userId = userId;
      } else {
        if (!departmentId) {
          setError('Veuillez sélectionner un service');
          setLoading(false);
          return;
        }
        request.departmentId = departmentId;
      }

      await api.post('/assignments/assign', request);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'affectation');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setType('user');
    setUserId('');
    setDepartmentId('');
    setComment('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (loadingData) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Affecter le matériel</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
        
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Type d'affectation</InputLabel>
                <Select
                  value={type}
                  label="Type d'affectation"
                  onChange={(e) => setType(e.target.value)}
                >
                  <MenuItem value="user">À un utilisateur</MenuItem>
                  <MenuItem value="department">À un service</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {type === 'user' ? (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Utilisateur</InputLabel>
                  <Select
                    value={userId}
                    label="Utilisateur"
                    onChange={(e) => setUserId(e.target.value)}
                  >
                    <MenuItem value="">-- Sélectionner --</MenuItem>
                    {users.map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.fullName} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ) : (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Service</InputLabel>
                  <Select
                    value={departmentId}
                    label="Service"
                    onChange={(e) => setDepartmentId(e.target.value)}
                  >
                    <MenuItem value="">-- Sélectionner --</MenuItem>
                    {departments.map(dept => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Commentaire (optionnel)"
                multiline
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ex: Matériel affecté pour le projet X..."
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
          disabled={loading || (type === 'user' ? !userId : !departmentId)}
          sx={{ bgcolor: '#27ae60', '&:hover': { bgcolor: '#229954' } }}
        >
          {loading ? <CircularProgress size={24} /> : 'Affecter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignmentModal;