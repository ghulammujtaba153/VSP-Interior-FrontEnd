import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/context/authContext'; // Assuming you have this

const PermissionWrapper = ({ 
  children, 
  resource, 
  action = 'canView', 
  fallback = null,
  showDeniedMessage = true,
  customDeniedMessage = null
}) => {
  const { hasPermission, showPermissionDenied } = usePermissions();
  const { user } = useAuth(); // Add this to get user role



  // ✅ Always allow superadmin
  const userHasPermission = user?.Role.name === 'superadmin' 
    ? true 
    : hasPermission(resource, action);

  // If user doesn't have permission
  if (!userHasPermission) {
    // If we want to show a denied message when clicked
    if (showDeniedMessage && React.isValidElement(children)) {
      return React.cloneElement(children, {
        onClick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          const message = customDeniedMessage || `access ${resource}`;
          showPermissionDenied(resource, action.replace('can', '').toLowerCase());

          // Call original onClick if it exists
          if (children.props.onClick) {
            children.props.onClick(e);
          }
        },
        style: {
          ...children.props.style,
          opacity: 0.6,
          cursor: 'not-allowed'
        }
      });
    }

    // Return fallback component or null
    return fallback;
  }

  // User has permission, render children normally
  return children;
};

export default PermissionWrapper;
