import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '../../components/customer/Header';
import Navbar from '../../components/customer/Navbar';
import { userApi } from '../../services/userApi';
import { MapPin, Plus, Trash2, Edit3, CheckCircle, ShieldCheck } from 'lucide-react';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  streetAddress: z.string().min(5, 'Street address is required'),
  apartmentSuite: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  phone: z.string().min(7, 'Phone number is required'),
  isDefaultShipping: z.boolean().default(false),
  isDefaultBilling: z.boolean().default(false),
});

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
  });

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const res = await userApi.getAddresses();
      setAddresses(res.data.addresses);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const openCreateModal = () => {
    setEditingAddress(null);
    reset({
      fullName: '',
      streetAddress: '',
      apartmentSuite: '',
      city: '',
      state: '',
      postalCode: '',
      phone: '',
      isDefaultShipping: false,
      isDefaultBilling: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (addr) => {
    setEditingAddress(addr);
    reset({
      fullName: addr.fullName,
      streetAddress: addr.streetAddress,
      apartmentSuite: addr.apartmentSuite || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      phone: addr.phone,
      isDefaultShipping: addr.isDefaultShipping,
      isDefaultBilling: addr.isDefaultBilling,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingAddress) {
        await userApi.updateAddress(editingAddress.id, data);
      } else {
        await userApi.createAddress(data);
      }
      setIsModalOpen(false);
      loadAddresses();
    } catch (err) {
      console.error('Failed to save address:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await userApi.deleteAddress(id);
        loadAddresses();
      } catch (err) {
        console.error('Failed to delete address:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <Navbar />

      <main className="max-w-7xl w-full mx-auto p-6 flex-grow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center space-x-2">
              <MapPin className="w-7 h-7 text-amazon-orange" />
              <span>Your Shipping & Billing Addresses</span>
            </h1>
            <p className="text-xs text-gray-600 mt-1">Manage saved delivery addresses for quick checkout.</p>
          </div>

          <button
            onClick={openCreateModal}
            className="bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold text-xs px-4 py-2.5 rounded shadow flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amazon-orange mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Add Address Card */}
            <button
              onClick={openCreateModal}
              className="border-2 border-dashed border-gray-300 hover:border-amazon-orange rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:text-amazon-orange transition bg-white min-h-[200px]"
            >
              <Plus className="w-10 h-10 mb-2" />
              <span className="font-bold text-sm">Add Address</span>
            </button>

            {/* Address List */}
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white border rounded-lg p-5 shadow-sm flex flex-col justify-between relative"
              >
                <div>
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {addr.isDefaultShipping && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Default Shipping
                      </span>
                    )}
                    {addr.isDefaultBilling && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Default Billing
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-gray-900 mb-1">{addr.fullName}</h3>
                  <p className="text-xs text-gray-700">{addr.streetAddress}</p>
                  {addr.apartmentSuite && <p className="text-xs text-gray-700">{addr.apartmentSuite}</p>}
                  <p className="text-xs text-gray-700">
                    {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                  <p className="text-xs text-gray-700 font-medium">{addr.country}</p>
                  <p className="text-xs text-gray-500 mt-2">Phone: {addr.phone}</p>
                </div>

                <div className="border-t pt-3 mt-4 flex items-center space-x-4 text-xs font-semibold text-blue-600">
                  <button onClick={() => openEditModal(addr)} className="hover:underline flex items-center space-x-1">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="hover:underline text-red-600 flex items-center space-x-1">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1">Full Name</label>
                  <input {...register('fullName')} className="w-full border p-2 rounded" />
                  {errors.fullName && <p className="text-red-600 mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block font-bold mb-1">Street Address</label>
                  <input {...register('streetAddress')} className="w-full border p-2 rounded" />
                  {errors.streetAddress && <p className="text-red-600 mt-1">{errors.streetAddress.message}</p>}
                </div>

                <div>
                  <label className="block font-bold mb-1">Apartment, suite, unit (optional)</label>
                  <input {...register('apartmentSuite')} className="w-full border p-2 rounded" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold mb-1">City</label>
                    <input {...register('city')} className="w-full border p-2 rounded" />
                    {errors.city && <p className="text-red-600 mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block font-bold mb-1">State</label>
                    <input {...register('state')} className="w-full border p-2 rounded" />
                    {errors.state && <p className="text-red-600 mt-1">{errors.state.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold mb-1">ZIP / Postal Code</label>
                    <input {...register('postalCode')} className="w-full border p-2 rounded" />
                    {errors.postalCode && <p className="text-red-600 mt-1">{errors.postalCode.message}</p>}
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Phone Number</label>
                    <input {...register('phone')} className="w-full border p-2 rounded" />
                    {errors.phone && <p className="text-red-600 mt-1">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" {...register('isDefaultShipping')} className="rounded" />
                    <span>Set as default shipping address</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" {...register('isDefaultBilling')} className="rounded" />
                    <span>Set as default billing address</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amazon-yellow text-amazon-blue font-bold rounded hover:bg-yellow-400"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AddressManager;
