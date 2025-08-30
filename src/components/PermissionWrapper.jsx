// import React from 'react';
// import { usePermissions } from '@/hooks/usePermissions';
// import { useAuth } from '@/context/authContext';

// const PermissionWrapper = ({ 
//   children, 
//   resource, 
//   action = 'canView', 
//   fallback = null,
//   showDeniedMessage = true,
//   customDeniedMessage = null
// }) => {
//   const { hasPermission, showPermissionDenied } = usePermissions();
//   const { user } = useAuth();

//   // ✅ Always allow superadmin
//   const userHasPermission = hasPermission(resource, action);

//   if (!userHasPermission) {
//     if (showDeniedMessage && React.isValidElement(children)) {
//       return React.cloneElement(children, {
//         // 🚫 override click completely
//         onClick: (e) => {
//           e.preventDefault();
//           e.stopPropagation();
//           const message = customDeniedMessage || `access ${resource}`;
//           showPermissionDenied(resource, action.replace('can', '').toLowerCase());
//         },
//         style: {
//           ...children.props.style,
//           opacity: 0.6,
//           cursor: 'not-allowed'
//         }
//       });
//     }
//     return fallback;
//   }

//   // ✅ User has permission
//   return children;
// };

// export default PermissionWrapper;


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
  const { user } = useAuth();

  // Wait for user to be loaded
  if (!user) {
    console.log('User not loaded yet, showing fallback for:', resource);
    return fallback || null;
  }

  // Check if user has proper role structure (try both Role and role)
  const roleName = user?.Role?.name || user?.role?.name;
  if (!roleName) {
    console.log('User role not found in either Role.name or role.name, showing fallback for:', resource);
    console.log('User object structure:', user);
    return fallback || null;
  }

  // ✅ Always allow superadmin - check this first (case-insensitive and robust)
  const isSuperAdmin = roleName && (
    roleName.toLowerCase().trim() == 'superadmin' ||
    roleName.toLowerCase().trim() == 'super admin' ||
    roleName.toLowerCase().trim() == 'super_admin'
  );
  
  // Debug logging
  console.log('PermissionWrapper Debug:', {
    resource,
    action,
    userRole: user?.Role?.name,
    userRoleAlt: user?.role?.name,
    userRoleType: typeof user?.Role?.name,
    userRoleRaw: user?.Role,
    userRoleAltRaw: user?.role,
    isSuperAdmin,
    user: user,
    userKeys: Object.keys(user || {}),
    roleKeys: Object.keys(user?.Role || {}),
    roleAltKeys: Object.keys(user?.role || {})
  });
  
  // If superadmin, bypass all permission checks
  if (isSuperAdmin) {
    console.log('Superadmin detected - allowing access to:', resource);
    return children;
  }

  // Temporary debug: log the exact role name for troubleshooting
  console.log('Role name analysis:', {
    roleName,
    roleNameLower: roleName?.toLowerCase(),
    roleNameTrimmed: roleName?.toLowerCase()?.trim(),
    isSuperAdmin,
    expectedValues: ['superadmin', 'super admin', 'super_admin']
  });

  // TEMPORARY: Hardcoded superadmin check for debugging
  if (roleName && roleName.includes('super')) {
    console.log('Temporary superadmin override detected for role:', roleName);
    return children;
  }

  // For non-superadmin users, use the usePermissions hook
  const { hasPermission, showPermissionDenied } = usePermissions();
  const userHasPermission = hasPermission(resource, action);

  console.log('Non-superadmin permission check:', {
    resource,
    action,
    userHasPermission
  });

  if (!userHasPermission) {
    if (showDeniedMessage && React.isValidElement(children)) {
      return React.cloneElement(children, {
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
