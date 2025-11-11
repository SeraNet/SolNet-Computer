import { db } from '../server/db';
import { sql } from 'drizzle-orm';

/**
 * Script to analyze database query performance
 * Run with: npx tsx scripts/analyze-query-performance.ts
 */

async function analyzeQueryPerformance() {
  console.log('📊 Analyzing Query Performance...\n');

  try {
    // 1. Check index usage statistics
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. INDEX USAGE STATISTICS (Top 20)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const indexUsage = await db.execute(sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan as index_scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      ORDER BY idx_scan DESC
      LIMIT 20;
    `);

    console.table(indexUsage.rows);

    // 2. Check table sizes
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('2. TABLE SIZES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const tableSizes = await db.execute(sql`
      SELECT 
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
        pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - 
                      pg_relation_size(schemaname||'.'||tablename)) AS indexes_size,
        (SELECT count(*) FROM information_schema.columns 
         WHERE table_schema = schemaname AND table_name = tablename) as columns
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    `);

    console.table(tableSizes.rows);

    // 3. Check for missing indexes
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('3. TABLES WITHOUT INDEXES (Potential Performance Issues)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const missingIndexes = await db.execute(sql`
      SELECT 
        t.tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        (SELECT count(*) FROM pg_indexes WHERE tablename = t.tablename) as index_count
      FROM pg_tables t
      WHERE schemaname = 'public'
        AND NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE tablename = t.tablename
        )
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    `);

    if (missingIndexes.rows.length > 0) {
      console.table(missingIndexes.rows);
    } else {
      console.log('✅ All tables have at least one index');
    }

    // 4. Check slow queries (if pg_stat_statements is available)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('4. SLOWEST QUERIES (if pg_stat_statements enabled)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
      await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_stat_statements`);
      const slowQueries = await db.execute(sql`
        SELECT 
          LEFT(query, 100) as query_preview,
          calls,
          ROUND(total_exec_time::numeric, 2) as total_time_ms,
          ROUND(mean_exec_time::numeric, 2) as avg_time_ms,
          ROUND(max_exec_time::numeric, 2) as max_time_ms
        FROM pg_stat_statements
        WHERE query NOT LIKE '%pg_stat%'
          AND query NOT LIKE '%pg_class%'
        ORDER BY mean_exec_time DESC
        LIMIT 10;
      `);

      console.table(slowQueries.rows);
    } catch (error) {
      console.log('ℹ️  pg_stat_statements extension not available');
      console.log('   Install with: CREATE EXTENSION pg_stat_statements;');
    }

    // 5. Check sequential scans (table scans without indexes)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('5. SEQUENTIAL SCANS (Tables being scanned without indexes)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const seqScans = await db.execute(sql`
      SELECT 
        schemaname,
        tablename,
        seq_scan,
        seq_tup_read,
        idx_scan,
        ROUND(100.0 * seq_scan / NULLIF(seq_scan + idx_scan, 0), 2) as seq_scan_pct,
        pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS size
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
        AND seq_scan > 0
      ORDER BY seq_scan DESC
      LIMIT 15;
    `);

    console.table(seqScans.rows);

    // 6. Recommendations
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('6. RECOMMENDATIONS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const recommendations: string[] = [];

    // Check for tables with high sequential scans
    seqScans.rows.forEach((row: any) => {
      if (row.seq_scan_pct > 50 && row.seq_scan > 1000) {
        recommendations.push(
          `⚠️  Table "${row.tablename}" has ${row.seq_scan_pct}% sequential scans (${row.seq_scan} scans). Consider adding more indexes.`
        );
      }
    });

    // Check for unused indexes
    const unusedIndexes = await db.execute(sql`
      SELECT 
        schemaname,
        tablename,
        indexname
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
        AND idx_scan = 0
        AND indexname NOT LIKE '%_pkey';
    `);

    if (unusedIndexes.rows.length > 0) {
      recommendations.push(
        `📉 Found ${unusedIndexes.rows.length} unused indexes that could be removed to save space`
      );
    }

    if (recommendations.length === 0) {
      console.log('✅ Database performance looks good!');
    } else {
      recommendations.forEach(rec => console.log(rec));
    }

    console.log('\n✅ Analysis complete!\n');
    
  } catch (error) {
    console.error('❌ Error analyzing query performance:', error);
    throw error;
  }
}

// Run the analysis
analyzeQueryPerformance()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

