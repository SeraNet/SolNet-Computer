import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function debugRecipientGroups() {
  try {
    await client.connect();
    console.log("✅ Connected to database");

    // Test 1: Check if tables exist and have correct structure

    const tablesResult = await client.query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name IN ('recipient_groups', 'recipient_group_members', 'customers')
      ORDER BY table_name, ordinal_position;
    `);

    tablesResult.rows.forEach((row) => {
      console.log(
        `  ${row.table_name}.${row.column_name}: ${row.data_type} (${
          row.is_nullable === "YES" ? "nullable" : "not null"
        })`
      );
    });

    // Test 2: Check if there are any groups
    const groupsResult = await client.query(`
      SELECT id, name, description 
      FROM recipient_groups 
      LIMIT 5;
    `);

    groupsResult.rows.forEach((group) => {
    });

    // Test 3: Check if there are any customers
    const customersResult = await client.query(`
      SELECT id, name, phone 
      FROM customers 
      LIMIT 5;
    `);

    customersResult.rows.forEach((customer) => {
    });

    // Test 4: Test the specific query that's failing
    if (groupsResult.rows.length > 0 && customersResult.rows.length > 0) {
      const groupId = groupsResult.rows[0].id;

      try {
        const membersResult = await client.query(
          `
          SELECT customer_id 
          FROM recipient_group_members 
          WHERE group_id = $1
        `,
          [groupId]
        );


        if (membersResult.rows.length > 0) {
          const customerIds = membersResult.rows.map((m) => m.customer_id);

          const customersInGroup = await client.query(
            `
            SELECT id, name, phone 
            FROM customers 
            WHERE id = ANY($1)
          `,
            [customerIds]
          );

        }
      } catch (error) {
      }
    }

    // Test 5: Test adding a customer to a group
    if (groupsResult.rows.length > 0 && customersResult.rows.length > 0) {
      const groupId = groupsResult.rows[0].id;
      const customerId = customersResult.rows[0].id;

      try {
        await client.query(
          `
          INSERT INTO recipient_group_members (group_id, customer_id)
          VALUES ($1, $2)
          ON CONFLICT (group_id, customer_id) DO NOTHING
        `,
          [groupId, customerId]
        );

        console.log("✅ Customer added to group successfully");
      } catch (error) {
      }
    }
  } catch (error) {
  } finally {
    await client.end();
  }
}

debugRecipientGroups();