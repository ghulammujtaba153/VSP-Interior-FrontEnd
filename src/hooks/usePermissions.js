import { useAuth } from '@/context/authContext';
import { toast } from 'react-toastify';

export const usePermissions = () => {
  const { user } = useAuth();

  // Check if user has permission for a specific resource and action
  const hasPermission = (resourceName, action = 'canView') => {
    if (!user || !user.Role || !user.Role.Permissions) {
      return false;
    }

    const permission = user.Role.Permissions.find(
      (perm) => perm.Resource.name.toLowerCase() === resourceName.toLowerCase()
    );

    return permission ? permission[action] : false;
  };

  // Check if user can view a resource
  const canView = (resourceName) => hasPermission(resourceName, 'canView');

  // Check if user can create in a resource
  const canCreate = (resourceName) => hasPermission(resourceName, 'canCreate');

  // Check if user can edit a resource
  const canEdit = (resourceName) => hasPermission(resourceName, 'canEdit');

  // Check if user can delete from a resource
  const canDelete = (resourceName) => hasPermission(resourceName, 'canDelete');

  // Show permission denied notification
  const showPermissionDenied = (resourceName, action = 'access') => {
    toast.error(`You don't have permission to ${action} ${resourceName}`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Get all accessible resources for the user
  const getAccessibleResources = () => {
    if (!user || !user.Role || !user.Role.Permissions) {
      return [];
    }

    return user.Role.Permissions
      .filter(perm => perm.canView)
      .map(perm => perm.Resource.name.toLowerCase());
  };

  return {
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    showPermissionDenied,
    getAccessibleResources,
    userPermissions: user?.Role?.Permissions || []
  };
};