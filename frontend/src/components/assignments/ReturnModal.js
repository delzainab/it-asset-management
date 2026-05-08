import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';
import api from '../../services/api';

const ReturnModal = ({ open, onClose, assetId, assetName, onSuccess }) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      await api.post(`/assignments/return/${assetId}`, { comment });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du retour');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setComment('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Retour en stock</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
        
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Confirmez-vous le retour du matériel en stock ?
          </Typography>
          
          <TextField
            fullWidth
            label="Commentaire (optionnel)"
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ex: Retour après fin de mission..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading}
          sx={{ bgcolor: '#e67e22', '&:hover': { bgcolor: '#d35400' } }}
        >
          {loading ? <CircularProgress size={24} /> : 'Confirmer le retour'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReturnModal;