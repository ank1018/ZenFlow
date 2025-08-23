import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShimmerLoader from './ShimmerLoader';

const InsightsShimmer: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header Shimmer */}
      <View style={styles.headerShimmer}>
        <View style={styles.headerContent}>
          <ShimmerLoader width={120} height={24} borderRadius={12} />
          <ShimmerLoader width={80} height={16} borderRadius={8} />
        </View>
        <ShimmerLoader width={48} height={48} borderRadius={24} />
      </View>

      {/* Stats Cards Shimmer */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <ShimmerLoader width={60} height={32} borderRadius={16} />
          <ShimmerLoader
            width={100}
            height={16}
            borderRadius={8}
            style={{ marginTop: 8 }}
          />
          <ShimmerLoader
            width={80}
            height={12}
            borderRadius={6}
            style={{ marginTop: 4 }}
          />
        </View>

        <View style={styles.statCard}>
          <ShimmerLoader width={60} height={32} borderRadius={16} />
          <ShimmerLoader
            width={100}
            height={16}
            borderRadius={8}
            style={{ marginTop: 8 }}
          />
          <ShimmerLoader
            width={80}
            height={12}
            borderRadius={6}
            style={{ marginTop: 4 }}
          />
        </View>
      </View>

      {/* Usage Graph Section Shimmer */}
      <View style={styles.graphSection}>
        <View style={styles.sectionHeader}>
          <ShimmerLoader width={140} height={20} borderRadius={10} />
          <ShimmerLoader width={100} height={14} borderRadius={7} />
        </View>

        {/* Graph Bars Shimmer */}
        <View style={styles.graphContainer}>
          <View style={styles.graphBars}>
            {[1, 2, 3, 4, 5, 6, 7].map(day => (
              <View key={day} style={styles.barContainer}>
                <ShimmerLoader
                  width={20}
                  height={Math.random() * 80 + 40}
                  borderRadius={10}
                />
                <ShimmerLoader
                  width={30}
                  height={12}
                  borderRadius={6}
                  style={{ marginTop: 8 }}
                />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Usage Breakdown Card Shimmer */}
      <View style={styles.cardShimmer}>
        <View style={styles.cardHeader}>
          <ShimmerLoader width={120} height={18} borderRadius={9} />
          <ShimmerLoader width={80} height={14} borderRadius={7} />
        </View>

        <View style={styles.appList}>
          {[1, 2, 3, 4].map(app => (
            <View key={app} style={styles.appItem}>
              <ShimmerLoader width={32} height={32} borderRadius={16} />
              <View style={styles.appInfo}>
                <ShimmerLoader width={100} height={14} borderRadius={7} />
                <ShimmerLoader width={60} height={12} borderRadius={6} />
              </View>
              <ShimmerLoader width={50} height={16} borderRadius={8} />
            </View>
          ))}
        </View>
      </View>

      {/* Top Apps Card Shimmer */}
      <View style={styles.cardShimmer}>
        <View style={styles.cardHeader}>
          <ShimmerLoader width={100} height={18} borderRadius={9} />
          <ShimmerLoader width={80} height={14} borderRadius={7} />
        </View>

        <View style={styles.appList}>
          {[1, 2, 3, 4, 5].map(app => (
            <View key={app} style={styles.appItem}>
              <ShimmerLoader width={32} height={32} borderRadius={16} />
              <View style={styles.appInfo}>
                <ShimmerLoader width={120} height={14} borderRadius={7} />
                <ShimmerLoader width={80} height={12} borderRadius={6} />
              </View>
              <ShimmerLoader width={60} height={16} borderRadius={8} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  headerShimmer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
    gap: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  graphSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
    gap: 4,
  },
  graphContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
  },
  graphBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  cardShimmer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    marginBottom: 16,
    gap: 4,
  },
  appList: {
    gap: 12,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appInfo: {
    flex: 1,
    gap: 4,
  },
});

export default InsightsShimmer;
