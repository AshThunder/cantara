import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useParty } from '@/providers/PartyProvider';
import {
  Landing, Dashboard, Send, Request, Activity, Business,
  Subscriptions, Refunds, MultiSend, Checkout, Pay, Invoices, InvoiceNew,
} from '@/pages';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isConnected } = useParty();
  return isConnected ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pay/:id?" element={<Pay />} />
        <Route path="/checkout" element={<Checkout />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/send" element={<ProtectedRoute><Send /></ProtectedRoute>} />
        <Route path="/multi-send" element={<ProtectedRoute><MultiSend /></ProtectedRoute>} />
        <Route path="/request" element={<ProtectedRoute><Request /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
        <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
        <Route path="/refunds" element={<ProtectedRoute><Refunds /></ProtectedRoute>} />
        <Route path="/business" element={<ProtectedRoute><Business /></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
        <Route path="/invoices/new" element={<ProtectedRoute><InvoiceNew /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
