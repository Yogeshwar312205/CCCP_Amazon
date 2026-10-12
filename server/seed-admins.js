
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./src/models');

const accounts = [
  {
    firstName: 'Super',
    lastName: 'Admin',
    email: 'superadmin@amazon.com',
    password: process.env.SEED_SUPERADMIN_PASSWORD,
    role: 'SUPER_ADMIN',
    phone: '+18005550001',
  },
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@amazon.com',
    password: process.env.SEED_ADMIN_PASSWORD,
    role: 'ADMIN',
    phone: '+18005550002',
  },
];

async function main() {
  if (accounts.some(account => !account.password)) {
    throw new Error('Set both seed password environment variables first.');
  }

  try {
    await sequelize.authenticate();
    console.log('Database connection successful.');

    for (const account of accounts) {
      const existing = await User.findOne({
        where: { email: account.email },
      });

      if (existing) {
        console.log(
          `Skipped ${account.email}: account already exists (role: ${existing.role}).`
        );
        continue;
      }

      const hashedPassword = await bcrypt.hash(account.password, 10);

      await User.create({
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        phone: account.phone,
        password: hashedPassword,
        role: account.role,
        isActive: true,
      });

      console.log(`Created ${account.role}: ${account.email}`);
    }

    console.log('Admin seeding completed.');
  } finally {
    await sequelize.close();
  }
}

main().catch(error => {
  console.error('Admin seeding failed:', error.message);
  process.exitCode = 1;
});
