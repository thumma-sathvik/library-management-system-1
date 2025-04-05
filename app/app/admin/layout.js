'use client'
import AdminLayout from '../adminhome/layout';

const AdminRoutesLayout = ({ children }) => {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
};

export default AdminRoutesLayout;