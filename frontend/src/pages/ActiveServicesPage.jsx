// pages/ActiveServicesPage.js
import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EscrowContext } from '../context/EscrowContext';
import { AppContext } from '../context/AppContext';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  User 
} from 'lucide-react';

const ActiveServicesPage = () => {
  const { escrows, loading, error, fetchEscrows } = useContext(EscrowContext);
  const { user } = useContext(AppContext);
  
  useEffect(() => {
    fetchEscrows();
  }, []);
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" />;
      case 'client_confirmed':
      case 'provider_confirmed':
        return <Clock className="text-blue-500" />;
      case 'completed':
        return <CheckCircle className="text-green-500" />;
      case 'disputed':
        return <AlertTriangle className="text-red-500" />;
      case 'cancelled':
        return <XCircle className="text-gray-500" />;
      default:
        return <Clock className="text-gray-500" />;
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Awaiting confirmation';
      case 'client_confirmed':
        return 'Client confirmed, awaiting provider';
      case 'provider_confirmed':
        return 'Provider confirmed, awaiting client';
      case 'completed':
        return 'Service completed';
      case 'disputed':
        return 'Service disputed';
      case 'cancelled':
        return 'Service cancelled';
      default:
        return status;
    }
  };
  
  const getUserRole = (escrow) => {
    if (escrow.clientId === user._id) {
      return 'Client';
    } else if (escrow.providerId === user._id) {
      return 'Provider';
    }
    return '';
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b p-4">
          <h1 className="text-2xl font-bold">Active Services</h1>
        </div>
        
        <div className="p-4">
          {escrows.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <User size={24} className="text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No active services</h3>
              <p className="text-gray-500">
                You don't have any active service requests or offerings at the moment.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {escrows.map((escrow) => (
                <Link 
                  key={escrow._id} 
                  to={`/service/${escrow.requestId}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {getStatusIcon(escrow.status)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {escrow.lastMessage || 'Service Request'}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500">
                              {getStatusText(escrow.status)}
                            </span>
                            <span className="mx-1 text-gray-300">•</span>
                            <span className="text-xs text-gray-500">
                              {getUserRole(escrow)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveServicesPage;