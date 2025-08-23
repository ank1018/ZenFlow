import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface InsightCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  actionText?: string;
  onActionPress?: () => void;
  type: 'tip' | 'warning' | 'achievement' | 'suggestion';
}

const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  icon,
  color,
  actionText,
  onActionPress,
  type,
}) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'tip':
        return 'lightbulb';
      case 'warning':
        return 'alert-circle';
      case 'achievement':
        return 'star';
      case 'suggestion':
        return 'trending-up';
      default:
        return 'information';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'tip':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'achievement':
        return '#8B5CF6';
      case 'suggestion':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Icon name={icon} size={20} color="#FFFFFF" />
        </View>
        <View style={styles.typeIndicator}>
          <Icon name={getTypeIcon()} size={16} color={getTypeColor()} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        {actionText && onActionPress && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: color }]}
            onPress={onActionPress}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>{actionText}</Text>
            <Icon name="arrow-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default InsightCard;
