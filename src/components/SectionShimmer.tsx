import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShimmerLoader from './ShimmerLoader';

interface SectionShimmerProps {
  title?: boolean;
  subtitle?: boolean;
  items?: number;
  showIcons?: boolean;
  style?: any;
}

const SectionShimmer: React.FC<SectionShimmerProps> = ({
  title = true,
  subtitle = true,
  items = 3,
  showIcons = false,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {title && (
        <View style={styles.header}>
          <ShimmerLoader width={120} height={18} borderRadius={9} />
          {subtitle && (
            <ShimmerLoader width={80} height={14} borderRadius={7} />
          )}
        </View>
      )}

      <View style={styles.content}>
        {Array.from({ length: items }).map((_, index) => (
          <View key={index} style={styles.item}>
            {showIcons && (
              <ShimmerLoader width={32} height={32} borderRadius={16} />
            )}
            <View style={styles.itemContent}>
              <ShimmerLoader width={100} height={14} borderRadius={7} />
              <ShimmerLoader width={60} height={12} borderRadius={6} />
            </View>
            <ShimmerLoader width={50} height={16} borderRadius={8} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
    gap: 4,
  },
  content: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemContent: {
    flex: 1,
    gap: 4,
  },
});

export default SectionShimmer;
