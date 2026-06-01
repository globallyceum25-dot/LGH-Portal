import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/portal/Landing";
import PortalShell from "./pages/portal/PortalShell";
import PortalHome from "./pages/portal/PortalHome";
import PortalCompanies from "./pages/portal/PortalCompanies";
import PortalCompany from "./pages/portal/PortalCompany";

import Login from "./pages/admin/Login";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import SectorsAdmin from "./pages/admin/SectorsAdmin";
import CompaniesAdmin from "./pages/admin/CompaniesAdmin";
import CompanyForm from "./pages/admin/CompanyForm";

export default function App() {
  return (
    <Routes>
      {/* Entry */}
      <Route index element={<Landing />} />

      {/* Portal flow: sectors → companies → company */}
      <Route path="portal" element={<PortalShell />}>
        <Route index element={<PortalHome />} />
        <Route path=":sectorSlug" element={<PortalCompanies />} />
        <Route path=":sectorSlug/:companySlug" element={<PortalCompany />} />
      </Route>

      {/* Admin */}
      <Route path="admin/login" element={<Login />} />
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="sectors" element={<SectorsAdmin />} />
        <Route path="companies" element={<CompaniesAdmin />} />
        <Route path="companies/new" element={<CompanyForm />} />
        <Route path="companies/:id" element={<CompanyForm />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
