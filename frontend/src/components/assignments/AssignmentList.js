import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../services/api';

const AssignmentList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetHistory, setAssetHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/assignments/current');
      setAssignments(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des affectations');
    } finally {
      setLoading(false);
    }
  };

  const loadAssetHistory = async (assetId, assetName) => {
    setHistoryLoading(true);
    setSelectedAsset(assetName);
    try {
      const response = await api.get(`/assignments/asset/${assetId}`);
      setAssetHistory(response.data);
      setOpenHistoryDialog(true);
    } catch (err) {
      setError('Erreur lors du chargement de l\'historique');
    } finally {
      setHistoryLoading(false);
    }
  };

  const getTypeChip = (type) => {
    const colors = {
      'AFFECTATION': 'success',
      'RESTITUTION': 'warning',
      'TRANSFERT': 'info'
    };
    return <Chip size="small" color={colors[type] || 'default'} label={type} />;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString();
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
      <Typography variant="h4" gutterBottom>
        Affectations en cours
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Matériel</TableCell>
              <TableCell>Affecté à</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date d'affectation</TableCell>
              <TableCell>Commentaire</TableCell>
              <TableCell align="center">Historique</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucune affectation en cours
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.id} hover>
                  <TableCell>
                    {assignment.asset?.type} - {assignment.asset?.brand} {assignment.asset?.model}
                    <Typography variant="caption" display="block" color="text.secondary">
                      Série: {assignment.asset?.serialNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {assignment.user?.fullName || assignment.department?.name || '-'}
                    {assignment.user?.email && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {assignment.user.email}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{getTypeChip(assignment.type)}</TableCell>
                  <TableCell>
                    {formatDateTime(assignment.startDate)}
                  </TableCell>
                  <TableCell>{assignment.comment || '-'}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Voir l'historique complet">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => loadAssetHistory(assignment.asset.id, `${assignment.asset.type} - ${assignment.asset.brand} ${assignment.asset.model}`)}
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog d'historique */}
      <Dialog open={openHistoryDialog} onClose={() => setOpenHistoryDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Historique des affectations
          <IconButton
            onClick={() => setOpenHistoryDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Matériel: <strong>{selectedAsset}</strong>
              </Typography>
              {assetHistory.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  Aucun historique trouvé
                </Typography>
              ) : (
                <List>
                  {assetHistory.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <ListItem>
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Chip 
                              size="small" 
                              color={item.type === 'AFFECTATION' ? 'success' : 'warning'} 
                              label={item.type === 'AFFECTATION' ? 'Affectation' : 'Retour en stock'}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(item.createdAt)}
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            <strong>Affecté à:</strong> {item.user?.fullName || item.department?.name || '-'}
                          </Typography>
                          {item.user?.email && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              Email: {item.user.email}
                            </Typography>
                          )}
                          <Typography variant="body2">
                            <strong>Date début:</strong> {formatDateTime(item.startDate)}
                          </Typography>
                          {item.endDate && (
                            <Typography variant="body2">
                              <strong>Date fin:</strong> {formatDateTime(item.endDate)}
                            </Typography>
                          )}
                          {item.comment && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                              " {item.comment} "
                            </Typography>
                          )}
                        </Box>
                      </ListItem>
                      {index < assetHistory.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistoryDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignmentList;