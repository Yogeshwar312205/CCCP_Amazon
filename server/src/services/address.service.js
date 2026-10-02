const { Address, sequelize } = require('../models');

class AddressService {
  static async getUserAddresses(userId) {
    return await Address.findAll({
      where: { userId },
      order: [['isDefaultShipping', 'DESC'], ['createdAt', 'DESC']],
    });
  }

  static async createAddress(userId, addressData) {
    const transaction = await sequelize.transaction();
    try {
      if (addressData.isDefaultShipping) {
        await Address.update(
          { isDefaultShipping: false },
          { where: { userId }, transaction }
        );
      }
      if (addressData.isDefaultBilling) {
        await Address.update(
          { isDefaultBilling: false },
          { where: { userId }, transaction }
        );
      }

      const newAddress = await Address.create(
        {
          ...addressData,
          userId,
        },
        { transaction }
      );

      await transaction.commit();
      return newAddress;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async updateAddress(userId, addressId, addressData) {
    const transaction = await sequelize.transaction();
    try {
      const address = await Address.findOne({ where: { id: addressId, userId } });
      if (!address) {
        const error = new Error('Address not found');
        error.statusCode = 404;
        error.code = 'ADDRESS_NOT_FOUND';
        throw error;
      }

      if (addressData.isDefaultShipping) {
        await Address.update(
          { isDefaultShipping: false },
          { where: { userId }, transaction }
        );
      }
      if (addressData.isDefaultBilling) {
        await Address.update(
          { isDefaultBilling: false },
          { where: { userId }, transaction }
        );
      }

      await address.update(addressData, { transaction });
      await transaction.commit();
      return address;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async deleteAddress(userId, addressId) {
    const address = await Address.findOne({ where: { id: addressId, userId } });
    if (!address) {
      const error = new Error('Address not found');
      error.statusCode = 404;
      error.code = 'ADDRESS_NOT_FOUND';
      throw error;
    }
    await address.destroy();
    return true;
  }
}

module.exports = AddressService;
