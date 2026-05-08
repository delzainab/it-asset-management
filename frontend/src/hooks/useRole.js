import { useAuth } from '../contexts/AuthContext';

const useRole = () => {
  const { user } = useAuth();
  
  const roles = user?.roles || [];
  
  const isAdmin = roles.includes('ADMIN');
  const isTechnician = roles.includes('TECHNICIEN');
  const isConsultation = roles.includes('CONSULTATION');
  
  // Permissions générales
  const canView = () => true; // Tout le monde peut voir
  const canCreate = () => isAdmin; // Seul ADMIN peut créer
  const canEdit = () => isAdmin; // Seul ADMIN peut modifier
  const canDelete = () => isAdmin; // Seul ADMIN peut supprimer
  
  // Permissions spécifiques
  const canManageAssets = () => isAdmin;
  const canManageUsers = () => isAdmin;
  const canManageOffices = () => isAdmin;
  const canManageServices = () => isAdmin;
  const canManageAssignments = () => isAdmin;
  const canManageAuditLogs = () => isAdmin;
  
  // Tickets - ADMIN et TECHNICIEN
  const canCreateTicket = () => isAdmin || isTechnician;
  const canEditTicket = () => isAdmin || isTechnician;
  
  // Maintenances - ADMIN et TECHNICIEN
  const canCreateMaintenance = () => isAdmin || isTechnician;
  const canEditMaintenance = () => isAdmin || isTechnician;
  
  return {
    isAdmin,
    isTechnician,
    isConsultation,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canManageAssets,
    canManageUsers,
    canManageOffices,
    canManageServices,
    canManageAssignments,
    canManageAuditLogs,
    canCreateTicket,
    canEditTicket,
    canCreateMaintenance,
    canEditMaintenance
  };
};

export default useRole;