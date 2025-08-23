import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppUsageData } from '../services/AppUsageService';

const { width } = Dimensions.get('window');

interface UsageGraphProps {
  data: AppUsageData[];
}

interface DayData {
  date: string;
  totalUsage: number;
  categories: {
    [key: string]: number;
  };
  apps: {
    [key: string]: number;
  };
}

const UsageGraph: React.FC<UsageGraphProps> = ({ data }) => {
  const [selectedBar, setSelectedBar] = useState<number | null>(null);

  // Process data for graph - memoized to prevent recalculation
  const processedData = useMemo((): DayData[] => {
    const dayMap = new Map<string, DayData>();

    data.forEach(item => {
      const date = new Date(item.date).toISOString().split('T')[0];

      if (!dayMap.has(date)) {
        dayMap.set(date, {
          date,
          totalUsage: 0,
          categories: {
            social: 0,
            entertainment: 0,
            productivity: 0,
            health: 0,
            other: 0,
          },
          apps: {},
        });
      }

      const dayData = dayMap.get(date)!;
      dayData.totalUsage += item.usageTime;
      dayData.categories[item.category] += item.usageTime;

      if (!dayData.apps[item.appName]) {
        dayData.apps[item.appName] = 0;
      }
      dayData.apps[item.appName] += item.usageTime;
    });

    const sortedData = Array.from(dayMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    // Debug: Log the processed data
    const totalProcessedUsage = sortedData.reduce(
      (sum, day) => sum + day.totalUsage,
      0,
    );
    const avgProcessedDaily = totalProcessedUsage / sortedData.length;
    console.log(
      `📊 Processed ${
        sortedData.length
      } days with total usage: ${totalProcessedUsage} minutes (${(
        totalProcessedUsage / 60
      ).toFixed(1)} hours)`,
    );
    console.log(
      `📊 Average processed daily: ${avgProcessedDaily.toFixed(1)} minutes (${(
        avgProcessedDaily / 60
      ).toFixed(1)} hours)`,
    );

    return sortedData.slice(-7); // Show last 7 days
  }, [data]);

  const maxUsage = Math.max(...processedData.map(d => d.totalUsage), 1);

  // Calculate average for comparison - memoized
  const averageUsage = useMemo(() => {
    if (processedData.length === 0) return 0;
    return (
      processedData.reduce((sum, day) => sum + day.totalUsage, 0) /
      processedData.length
    );
  }, [processedData]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'social':
        return '#FBBF24';
      case 'entertainment':
        return '#A78BFA';
      case 'productivity':
        return '#60A5FA';
      case 'health':
        return '#34D399';
      default:
        return '#9CA3AF';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'social':
        return 'Social';
      case 'entertainment':
        return 'Entertainment';
      case 'productivity':
        return 'Productivity';
      case 'health':
        return 'Health';
      default:
        return 'Other';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getUsageStatus = (usage: number) => {
    if (usage > averageUsage * 1.2)
      return { status: 'high', color: '#EF4444', icon: 'trending-up' };
    if (usage < averageUsage * 0.8)
      return { status: 'low', color: '#10B981', icon: 'trending-down' };
    return { status: 'normal', color: '#6B7280', icon: 'minus' };
  };

  const renderBar = (dayData: DayData, index: number) => {
    const barHeight = 120;
    const categories = Object.entries(dayData.categories).filter(
      ([_, value]) => value > 0,
    );

    const isSelected = selectedBar === index;
    const usageStatus = getUsageStatus(dayData.totalUsage);

    if (categories.length === 0) {
      return (
        <TouchableOpacity
          key={index}
          style={styles.barContainer}
          onPress={() => setSelectedBar(isSelected ? null : index)}
          activeOpacity={0.7}
        >
          <View style={[styles.bar, styles.emptyBar, { height: barHeight }]}>
            <Icon name="circle-outline" size={16} color="#9CA3AF" />
            <Text style={styles.noDataText}>No data</Text>
          </View>
          <View style={styles.barLabel}>
            <Text style={styles.dateLabel}>{formatDate(dayData.date)}</Text>
            <Text style={styles.usageLabel}>0m</Text>
          </View>
        </TouchableOpacity>
      );
    }

    // Sort categories by usage for better stacking
    const sortedCategories = categories.sort(([, a], [, b]) => b - a);

    return (
      <TouchableOpacity
        key={index}
        style={[styles.barContainer, isSelected && styles.selectedBarContainer]}
        onPress={() => setSelectedBar(isSelected ? null : index)}
        activeOpacity={0.7}
      >
        <View style={[styles.bar, { height: barHeight }]}>
          {/* Usage status indicator */}
          <View
            style={[
              styles.usageIndicator,
              { backgroundColor: usageStatus.color },
            ]}
          >
            <Icon name={usageStatus.icon} size={8} color="#FFFFFF" />
          </View>

          {sortedCategories.map(([category, value], catIndex) => {
            const segmentHeight = (value / maxUsage) * barHeight;
            const color = getCategoryColor(category);

            // Calculate position from bottom
            let bottomOffset = 0;
            for (let i = catIndex + 1; i < sortedCategories.length; i++) {
              bottomOffset += (sortedCategories[i][1] / maxUsage) * barHeight;
            }

            return (
              <View
                key={category}
                style={[
                  styles.barSegment,
                  {
                    height: segmentHeight,
                    backgroundColor: color,
                    bottom: bottomOffset,
                    opacity: isSelected ? 1 : 0.9,
                  },
                ]}
              >
                {/* Gradient overlay for depth */}
                <View
                  style={[
                    styles.barGradient,
                    { backgroundColor: color + '20' },
                  ]}
                />
              </View>
            );
          })}

          {/* Selection highlight */}
          {isSelected && <View style={styles.selectionHighlight} />}
        </View>

        <View style={styles.barLabel}>
          <Text
            style={[styles.dateLabel, isSelected && styles.selectedDateLabel]}
          >
            {formatDate(dayData.date)}
          </Text>
          <Text
            style={[styles.usageLabel, isSelected && styles.selectedUsageLabel]}
          >
            {formatTime(dayData.totalUsage)}
          </Text>
          {isSelected && (
            <View style={styles.comparisonContainer}>
              {/* <Icon
                name={usageStatus.icon}
                size={12}
                color={usageStatus.color}
              /> */}
              <Text
                style={[styles.comparisonText, { color: usageStatus.color }]}
              >
                {averageUsage > 0 ? (
                  <>
                    {dayData.totalUsage > averageUsage ? '+' : ''}
                    {Math.round(
                      ((dayData.totalUsage - averageUsage) / averageUsage) *
                        100,
                    )}
                    %
                  </>
                ) : (
                  '0%'
                )}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderLegend = () => {
    const categories = [
      { key: 'health', name: 'Health', icon: 'heart' },
      { key: 'productivity', name: 'Productivity', icon: 'briefcase' },
      { key: 'social', name: 'Social', icon: 'account-group' },
      { key: 'entertainment', name: 'Entertainment', icon: 'movie' },
      { key: 'other', name: 'Other', icon: 'apps' },
    ];

    // Only show categories that have data
    const visibleCategories = categories.filter(cat =>
      processedData.some(day => day.categories[cat.key] > 0),
    );

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.legend}
      >
        {visibleCategories.map(category => (
          <View key={category.key} style={styles.legendItem}>
            <View
              style={[
                styles.legendIcon,
                { backgroundColor: getCategoryColor(category.key) },
              ]}
            >
              <Icon name={category.icon} size={12} color="#FFFFFF" />
            </View>
            <Text style={styles.legendText}>{category.name}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderDetailCard = () => {
    if (selectedBar === null || !processedData[selectedBar]) return null;

    const dayData = processedData[selectedBar];
    const categories = Object.entries(dayData.categories)
      .filter(([_, value]) => value > 0)
      .sort(([, a], [, b]) => b - a);

    return (
      <View style={styles.detailCard}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailTitle}>{formatDate(dayData.date)}</Text>
          <TouchableOpacity
            onPress={() => setSelectedBar(null)}
            style={styles.closeButton}
          >
            <Icon name="close" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <Text style={styles.detailSubtitle}>
          Total screen time: {formatTime(dayData.totalUsage)}
        </Text>

        <View style={styles.categoryBreakdown}>
          {categories.map(([category, value]) => (
            <View key={category} style={styles.categoryDetailItem}>
              <View style={styles.categoryDetailLeft}>
                <View
                  style={[
                    styles.categoryDetailIcon,
                    { backgroundColor: getCategoryColor(category) },
                  ]}
                />
                <Text style={styles.categoryDetailName}>
                  {getCategoryName(category)}
                </Text>
              </View>
              <View style={styles.categoryDetailRight}>
                <Text style={styles.categoryDetailTime}>
                  {formatTime(value)}
                </Text>
                <Text style={styles.categoryDetailPercent}>
                  {Math.round((value / dayData.totalUsage) * 100)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (processedData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon name="chart-line-variant" size={64} color="#E5E7EB" />
          </View>
          <Text style={styles.emptyText}>No usage data available</Text>
          <Text style={styles.emptySubtext}>
            Enable phone usage tracking to see your patterns
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.headerSection}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>Daily Usage Patterns</Text>
          <Text style={styles.sectionSubtitle}>
            Past 7 days of screen time
            {processedData.length > 0 &&
              processedData.some(day =>
                Object.values(day.apps).some(usage => usage > 1000),
              ) && (
                <Text style={{ color: '#F59E0B', fontWeight: '600' }}>
                  {' • Sample Data'}
                </Text>
              )}
          </Text>
        </View>
      </View>

      {/* Enhanced Graph */}
      <View style={styles.graphContainer}>
        {/* Average line indicator */}
        <View style={styles.averageLineContainer}>
          <View
            style={[
              styles.averageLineIndicator,
              {
                bottom: (averageUsage / maxUsage) * 120 + 60, // 60px offset for labels
              },
            ]}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.graph}
        >
          {processedData.map((dayData, index) => renderBar(dayData, index))}
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>{renderLegend()}</View>

      {/* Enhanced Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Icon name="clock-time-four" size={20} color="#3B82F6" />
          <View style={styles.summaryTextContainer}>
            <Text style={styles.summaryLabel}>Total Usage</Text>
            <Text style={styles.summaryValue}>
              {formatTime(
                processedData.reduce((sum, day) => sum + day.totalUsage, 0),
              )}
            </Text>
          </View>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Icon name="chart-line" size={20} color="#10B981" />
          <View style={styles.summaryTextContainer}>
            <Text style={styles.summaryLabel}>Daily Average</Text>
            <Text style={styles.summaryValue}>{formatTime(averageUsage)}</Text>
          </View>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Icon name="calendar-check" size={20} color="#8B5CF6" />
          <View style={styles.summaryTextContainer}>
            <Text style={styles.summaryLabel}>Days Tracked</Text>
            <Text style={styles.summaryValue}>{processedData.length}</Text>
          </View>
        </View>
      </View>

      {/* Detail Card */}
      {renderDetailCard()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  graphContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  averageLine: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  averageLineContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 1,
  },
  averageLineIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#6366F1',
    borderStyle: 'solid',
    borderWidth: 0,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  averageLineLabel: {
    position: 'absolute',
    right: 0,
    top: -25,
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '600',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  graph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 16,
    minWidth: width - 48,
  },
  barContainer: {
    alignItems: 'center',
    marginHorizontal: 6,
    minWidth: 40,
  },
  selectedBarContainer: {
    transform: [{ scale: 1.05 }],
  },
  bar: {
    width: 32,
    // borderRadius: 8,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  emptyBar: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  barSegment: {
    position: 'absolute',
    left: 0,
    right: 0,
    // borderRadius: 8,
    overflow: 'hidden',
  },
  barGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    borderRadius: 8,
  },
  usageIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  selectionHighlight: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  noDataText: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  barLabel: {
    alignItems: 'center',
    minHeight: 44,
  },
  dateLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedDateLabel: {
    color: '#6366F1',
    fontWeight: '600',
  },
  usageLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  selectedUsageLabel: {
    color: '#6366F1',
    fontSize: 14,
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  comparisonText: {
    fontSize: 10,
    fontWeight: '600',
  },
  legendContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FAFBFC',
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  detailCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  detailSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  categoryBreakdown: {
    gap: 12,
  },
  categoryDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryDetailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDetailIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryDetailName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  categoryDetailRight: {
    alignItems: 'flex-end',
  },
  categoryDetailTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  categoryDetailPercent: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: '#FFFFFF',
  },
  emptyIconContainer: {
    marginBottom: 20,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default UsageGraph;
