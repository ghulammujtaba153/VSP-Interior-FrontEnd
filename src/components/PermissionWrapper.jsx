import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/context/authContext';

const PermissionWrapper = ({ 
  children, 
  resource, 
  action = 'canView', 
  fallback = null,
  showDeniedMessage = true,
  customDeniedMessage = null
}) => {
  const { hasPermission, showPermissionDenied } = usePermissions();
  const { user } = useAuth();

  // ✅ Always allow superadmin
  const userHasPermission = hasPermission(resource, action);

  if (!userHasPermission) {
    if (showDeniedMessage && React.isValidElement(children)) {
      return React.cloneElement(children, {
        // 🚫 override click completely
        onClick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          const message = customDeniedMessage || `access ${resource}`;
          showPermissionDenied(resource, action.replace('can', '').toLowerCase());
        },
        style: {
          ...children.props.style,
          opacity: 0.6,
          cursor: 'not-allowed'
        }
      });
    }
    return fallback;
  }

  // ✅ User has permission
  return children;
};

export default PermissionWrapper;
