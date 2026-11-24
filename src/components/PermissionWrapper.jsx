import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/context/authContext';

const PermissionWrapper = ({
  children,
  resource,
  action = 'canView',
  fallback = null,
  showDeniedMessage = true,
}) => {
  const { user } = useAuth();
  const { hasPermission, showPermissionDenied } = usePermissions();

  if (!user) {
    return fallback || null;
  }

  const roleName = user?.Role?.name || user?.role?.name;
  const isSuperAdmin =
    roleName &&
    ['superadmin', 'super admin', 'super_admin'].includes(roleName.toLowerCase().trim());

  if (isSuperAdmin) {
    return children;
  }

  const userHasPermission = hasPermission(resource, action);

  if (!userHasPermission) {
    if (showDeniedMessage && React.isValidElement(children)) {
      return React.cloneElement(children, {
        disabled: true,
        onClick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          showPermissionDenied(resource, action.replace('can', '').toLowerCase());
        },
        style: {
          ...children.props.style,
          opacity: 0.6,
          cursor: 'not-allowed',
        },
      });
    }
    return fallback;
  }

  return children;
};

export default PermissionWrapper;
