import React from 'react';
import { Badge } from '@/components/ui/badge';

export const AdminBadge = ({ adminId, adminName }) => {
  // Generate a consistent color based on admin ID
  const getAdminColor = (adminId) => {
    // Simple hash function to generate consistent colors
    const colors = [
      '#4CAF50', '#2196F3', '#FF9800', '#E91E63', 
      '#9C27B0', '#3F51B5', '#00BCD4', '#009688'
    ];
    
    if (!adminId) return colors[0];
    
    // Generate a simple hash from the adminId
    const hash = adminId.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };
  
  const color = getAdminColor(adminId);
  
  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-3 h-3 rounded-full" 
        style={{ backgroundColor: color }}
        title={adminName || 'Unknown'}
      />
      <span>{adminName || 'Unknown'}</span>
    </div>
  );
};
