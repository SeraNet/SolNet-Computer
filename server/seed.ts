import { db } from "./db";
import bcrypt from "bcryptjs";
import {
  users,
  customers,
  deviceTypes,
  brands,
  models,
  serviceTypes,
  inventoryItems,
  devices,
  sales,
  saleItems,
} from "@shared/schema";
export async function seedDatabase() {
  try {
    // Seed Users
    const adminUser = await db
      .insert(users)
      .values({
        username: "admin",
        email: "admin@solnetcomputer.com",
        password: bcrypt.hashSync("admin123", 10), // Hash the password
        firstName: "Admin",
        lastName: "User",
        role: "admin",
      })
      .returning();
    const techUser = await db
      .insert(users)
      .values({
        username: "tech1",
        email: "tech@solnetcomputer.com",
        password: bcrypt.hashSync("tech123", 10), // Hash the password
        firstName: "John",
        lastName: "Technician",
        role: "technician",
      })
      .returning();
    const salesUser = await db
      .insert(users)
      .values({
        username: "sales1",
        email: "sales@solnetcomputer.com",
        password: bcrypt.hashSync("sales123", 10), // Hash the password
        firstName: "Jane",
        lastName: "Sales",
        role: "sales",
      })
      .returning();
    // Seed Device Types
    const laptopType = await db
      .insert(deviceTypes)
      .values({
        name: "Laptop",
        description: "Portable computers including notebooks and ultrabooks",
        category: "Computers",
      })
      .returning();
    const desktopType = await db
      .insert(deviceTypes)
      .values({
        name: "Desktop",
        description: "Desktop computers and workstations",
        category: "Computers",
      })
      .returning();
    const smartphoneType = await db
      .insert(deviceTypes)
      .values({
        name: "Smartphone",
        description: "Mobile phones and smartphones",
        category: "Mobile Devices",
      })
      .returning();
    const tabletType = await db
      .insert(deviceTypes)
      .values({
        name: "Tablet",
        description: "Tablet computers and iPads",
        category: "Mobile Devices",
      })
      .returning();
    // Seed Brands
    const appleBrand = await db
      .insert(brands)
      .values({
        name: "Apple",
      })
      .returning();
    const dellBrand = await db
      .insert(brands)
      .values({
        name: "Dell",
      })
      .returning();
    const hpBrand = await db
      .insert(brands)
      .values({
        name: "HP",
      })
      .returning();
    const lenovoBrand = await db
      .insert(brands)
      .values({
        name: "Lenovo",
      })
      .returning();
    const samsungBrand = await db
      .insert(brands)
      .values({
        name: "Samsung",
      })
      .returning();
    // Seed Models
    await db.insert(models).values([
      {
        name: 'MacBook Pro 13"',
        brandId: appleBrand[0].id,
        deviceTypeId: laptopType[0].id,
        specifications: JSON.stringify({
          screen: "13 inch",
          processor: "M1",
          ram: "8GB",
        }),
      },
      {
        name: 'MacBook Pro 16"',
        brandId: appleBrand[0].id,
        deviceTypeId: laptopType[0].id,
        specifications: JSON.stringify({
          screen: "16 inch",
          processor: "M1 Pro",
          ram: "16GB",
        }),
      },
      {
        name: "iPhone 14",
        brandId: appleBrand[0].id,
        deviceTypeId: smartphoneType[0].id,
        specifications: JSON.stringify({
          screen: "6.1 inch",
          storage: "128GB",
          color: "Blue",
        }),
      },
      {
        name: "iPad Pro",
        brandId: appleBrand[0].id,
        deviceTypeId: tabletType[0].id,
        specifications: JSON.stringify({
          screen: "12.9 inch",
          storage: "256GB",
          connectivity: "WiFi + Cellular",
        }),
      },
      {
        name: "XPS 13",
        brandId: dellBrand[0].id,
        deviceTypeId: laptopType[0].id,
        specifications: JSON.stringify({
          screen: "13.3 inch",
          processor: "Intel i7",
          ram: "16GB",
        }),
      },
      {
        name: "OptiPlex 7090",
        brandId: dellBrand[0].id,
        deviceTypeId: desktopType[0].id,
        specifications: JSON.stringify({
          processor: "Intel i5",
          ram: "8GB",
          storage: "256GB SSD",
        }),
      },
    ]);
    // Seed Service Types
    await db.insert(serviceTypes).values([
      {
        name: "Hardware Repair",
        description: "Physical component repair and replacement",
        estimatedDuration: 120,
        basePrice: "75.00",
      },
      {
        name: "Software Installation",
        description: "Operating system and software installation",
        estimatedDuration: 60,
        basePrice: "50.00",
      },
      {
        name: "Virus Removal",
        description: "Malware and virus detection and removal",
        estimatedDuration: 90,
        basePrice: "65.00",
      },
      {
        name: "Data Recovery",
        description: "Recovery of lost or corrupted data",
        estimatedDuration: 240,
        basePrice: "150.00",
      },
      {
        name: "Screen Replacement",
        description: "LCD/LED screen replacement and repair",
        estimatedDuration: 90,
        basePrice: "120.00",
      },
      {
        name: "Battery Replacement",
        description: "Laptop and mobile device battery replacement",
        estimatedDuration: 45,
        basePrice: "85.00",
      },
    ]);
    // Seed Inventory Items
    await db.insert(inventoryItems).values([
      {
        name: "Wireless Mouse",
        sku: "MOUSE-001",
        description: "Ergonomic wireless optical mouse",
        category: "Accessories",
        purchasePrice: "15.00",
        salePrice: "29.99",
        quantity: 25,
        minStockLevel: 10,
        supplier: "Tech Supplies Inc",
      },
      {
        name: "USB-C Cable",
        sku: "CABLE-USB-C-001",
        description: "USB-C to USB-C cable 6ft",
        category: "Cables",
        purchasePrice: "8.00",
        salePrice: "12.99",
        quantity: 2,
        minStockLevel: 10,
        supplier: "Cable Co",
      },
      {
        name: "Phone Case - iPhone 14",
        sku: "CASE-IP14-001",
        description: "Protective case for iPhone 14",
        category: "Cases",
        purchasePrice: "8.50",
        salePrice: "15.99",
        quantity: 18,
        minStockLevel: 20,
        supplier: "Mobile Accessories Ltd",
      },
      {
        name: "Keyboard - Mechanical",
        sku: "KB-MECH-001",
        description: "RGB mechanical gaming keyboard",
        category: "Peripherals",
        purchasePrice: "25.00",
        salePrice: "45.00",
        quantity: 12,
        minStockLevel: 5,
        supplier: "Gaming Gear Pro",
      },
      {
        name: "RAM 8GB DDR4",
        sku: "RAM-8GB-DDR4-001",
        description: "8GB DDR4 2666MHz memory module",
        category: "Components",
        purchasePrice: "35.00",
        salePrice: "55.00",
        quantity: 1,
        minStockLevel: 5,
        supplier: "Memory World",
      },
      {
        name: "Screen Protector",
        sku: "SP-UNIVERSAL-001",
        description: "Tempered glass screen protector",
        category: "Accessories",
        purchasePrice: "2.00",
        salePrice: "8.99",
        quantity: 3,
        minStockLevel: 20,
        supplier: "Screen Guard Co",
      },
      {
        name: "HDMI Cable 6ft",
        sku: "HDMI-6FT-001",
        description: "High-speed HDMI cable 6 feet",
        category: "Cables",
        purchasePrice: "6.00",
        salePrice: "12.50",
        quantity: 15,
        minStockLevel: 10,
        supplier: "Cable Co",
      },
      {
        name: "Laptop Charger - Universal",
        sku: "CHARGER-UNIV-001",
        description: "Universal laptop charger 90W",
        category: "Chargers",
        purchasePrice: "25.00",
        salePrice: "39.99",
        quantity: 8,
        minStockLevel: 5,
        supplier: "Power Solutions",
      },
    ]);
    // Seed Sample Customers
    const customer1 = await db
      .insert(customers)
      .values({
        name: "John Smith",
        email: "john.smith@email.com",
        phone: "(555) 123-4567",
        address: "123 Main St, Anytown, ST 12345",
      })
      .returning();
    const customer2 = await db
      .insert(customers)
      .values({
        name: "Sarah Johnson",
        email: "sarah.j@email.com",
        phone: "(555) 234-5678",
        address: "456 Oak Ave, Somewhere, ST 12346",
      })
      .returning();
    const customer3 = await db
      .insert(customers)
      .values({
        name: "Mike Davis",
        email: "mike.davis@email.com",
        phone: "(555) 345-6789",
        address: "789 Pine St, Elsewhere, ST 12347",
      })
      .returning();
  } catch (error) {
    throw error;
  }
}
// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      process.exit(1);
    });
}
