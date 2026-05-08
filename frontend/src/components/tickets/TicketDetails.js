import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  TextField,
  List,
  ListItem,
  ListItemText,
  Avatar,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ticketService from '../../services/ticket.service';
import userService from '../../services/user.service';
import assetService from '../../services/asset.service';
import useRole from '../../hooks/useRole';

const TicketDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin, isTechnician } = useRole();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [sending, setSending] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    assetId: ''
  });
  const [assets, setAssets] = useState([]);

  const canEdit = isAdmin || isTechnician;
  const canDelete = isAdmin;

  useEffect(() => {
    loadTicket();
    loadComments();
    loadTechnicians();
    loadAssets();
  }, [id]);

  const loadTicket = async () => {
    try {
      const data = await ticketService.getTicketById(id);
      setTicket(data);
      setFormData({
        title: data.title,
        description: data.description || '',
        priority: data.priority || 'MOYENNE',
        assetId: data.asset?.id || ''
      });
    } catch (err) {
      setError('Erreur lors du chargement du ticket');
    }
  };

  const loadComments = async () => {
    try {
      const data = await ticketService.getComments(id);
      setComments(data);
    } catch (err) {
      console.error('Erreur chargement commentaires:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicians = async () => {
    try {
      const users = await userService.getAllUsers();
      const techs = users.filter(u => u.role?.name === 'TECHNICIEN' || u.role?.name === 'ADMIN');
      setTechnicians(techs);
    } catch (err) {
      console.error('Erreur chargement techniciens:', err);
    }
  };

  const loadAssets = async () => {
    try {
      const data = await assetService.getAllAssets();
      setAssets(data);
    } catch (err) {
      console.error('Erreur chargement assets:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      await ticketService.addComment(id, newComment);
      setNewComment('');
      loadComments();
    } catch (err) {
      setError('Erreur lors de l\'ajout du commentaire');
    } finally {
      setSending(false);
    }
  };

  const handleAssignTechnician = async (technicianId) => {
    try {
      await ticketService.assignTicket(id, technicianId);
      loadTicket();
      setSuccess('Ticket assigné avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de l\'assignation');
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      await ticketService.updateStatus(id, status);
      loadTicket();
      setSuccess(`Statut mis à jour : ${status}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const handleUpdateTicket = async () => {
    try {
      await ticketService.updateTicket(id, formData);
      setEditMode(false);
      loadTicket();
      setSuccess('Ticket modifié avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la modification');
    }
  };

  const handleDeleteTicket = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) {
      try {
        await ticketService.deleteTicket(id);
        navigate('/tickets');
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'CRITIQUE': return 'error';
      case 'ELEVEE': return 'error';
      case 'MOYENNE': return 'warning';
      case 'BASSE': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'OUVERT': return 'error';
      case 'EN_COURS': return 'warning';
      case 'RESOLU': return 'success';
      case 'FERME': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="warning">Ticket non trouvé</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/tickets')}
        sx={{ mb: 2 }}
      >
        Retour à la liste
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            {editMode ? (
              <TextField
                fullWidth
                label="Titre"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                sx={{ mb: 2 }}
              />
            ) : (
              <Typography variant="h4" gutterBottom>
                #{ticket.id} - {ticket.title}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              {editMode ? (
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Priorité</InputLabel>
                  <Select
                    value={formData.priority}
                    label="Priorité"
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <MenuItem value="CRITIQUE">Critique</MenuItem>
                    <MenuItem value="ELEVEE">Élevée</MenuItem>
                    <MenuItem value="MOYENNE">Moyenne</MenuItem>
                    <MenuItem value="BASSE">Basse</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <Chip 
                  label={ticket.priority} 
                  color={getPriorityColor(ticket.priority)} 
                  size="small"
                />
              )}
              <Chip 
                label={ticket.status} 
                color={getStatusColor(ticket.status)} 
                size="small"
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {editMode ? (
              <>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      title: ticket.title,
                      description: ticket.description || '',
                      priority: ticket.priority,
                      assetId: ticket.asset?.id || ''
                    });
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleUpdateTicket}
                  disabled={!formData.title}
                  sx={{ bgcolor: '#27ae60' }}
                >
                  Sauvegarder
                </Button>
              </>
            ) : (
              <>
                {canEdit && ticket.status !== 'FERME' && ticket.status !== 'RESOLU' && (
                  <>
                    {ticket.status === 'OUVERT' && (
                      <Button
                        variant="contained"
                        startIcon={<AssignmentIcon />}
                        onClick={() => handleUpdateStatus('EN_COURS')}
                        sx={{ bgcolor: '#e67e22' }}
                      >
                        Prendre en charge
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleUpdateStatus('RESOLU')}
                      sx={{ bgcolor: '#27ae60' }}
                    >
                      Résoudre
                    </Button>
                  </>
                )}
                
                {canEdit && (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                  >
                    Modifier
                  </Button>
                )}
                
                {canDelete && (
                  <Button
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteTicket}
                    color="error"
                  >
                    Supprimer
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                {editMode ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    {ticket.description || 'Aucune description'}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {editMode && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Matériel concerné
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel>Matériel</InputLabel>
                    <Select
                      value={formData.assetId}
                      label="Matériel"
                      onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    >
                      <MenuItem value="">-- Aucun --</MenuItem>
                      {assets.map(asset => (
                        <MenuItem key={asset.id} value={asset.id}>
                          {asset.type} - {asset.brand} {asset.model} ({asset.serialNumber})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informations
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Créé par :</strong> {ticket.createdBy?.fullName || ticket.createdBy?.username || '-'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Date :</strong> {new Date(ticket.createdAt).toLocaleString()}
                </Typography>
                {ticket.assignedTo && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Assigné à :</strong> {ticket.assignedTo.fullName || ticket.assignedTo.username}
                  </Typography>
                )}
                {ticket.asset && !editMode && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Matériel :</strong> {ticket.asset.type} - {ticket.asset.brand} {ticket.asset.model}
                  </Typography>
                )}
                {ticket.resolvedDate && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Résolu le :</strong> {new Date(ticket.resolvedDate).toLocaleString()}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {!editMode && ticket.status === 'OUVERT' && technicians.length > 0 && canEdit && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Assigner à un technicien
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel>Technicien</InputLabel>
                    <Select
                      onChange={(e) => handleAssignTechnician(e.target.value)}
                      label="Technicien"
                      value=""
                    >
                      <MenuItem value="">-- Sélectionner --</MenuItem>
                      {technicians.map(tech => (
                        <MenuItem key={tech.id} value={tech.id}>
                          {tech.fullName || tech.username}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Commentaires ({comments.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <List>
          {comments.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              Aucun commentaire pour le moment
            </Typography>
          ) : (
            comments.map((comment) => (
              <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                <Avatar sx={{ mr: 2, bgcolor: '#e67e22' }}>
                  {comment.user?.fullName?.charAt(0) || comment.user?.username?.charAt(0) || 'U'}
                </Avatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography variant="subtitle2">
                        {comment.user?.fullName || comment.user?.username || 'Utilisateur'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                  secondary={comment.message}
                />
              </ListItem>
            ))
          )}
        </List>

        {ticket.status !== 'FERME' && (
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              placeholder="Ajouter un commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              multiline
              rows={2}
            />
            <Button
              variant="contained"
              onClick={handleAddComment}
              disabled={!newComment.trim() || sending}
              sx={{ bgcolor: '#e67e22', minWidth: 100 }}
            >
              {sending ? <CircularProgress size={24} /> : <SendIcon />}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default TicketDetails;