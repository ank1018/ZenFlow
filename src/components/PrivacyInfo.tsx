import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface PrivacyInfoProps {
  onClose: () => void;
  isVisible: boolean;
}

const PrivacyInfo: React.FC<PrivacyInfoProps> = ({ onClose, isVisible }) => {
  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>🔒 Privacy & Data Protection</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="shield-check" size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>Your Data Stays Private</Text>
            </View>
            <Text style={styles.sectionText}>
              ZenFlow is designed with privacy as a core principle. All your
              data is processed and stored locally on your device.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="cellphone-lock" size={20} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Local Processing Only</Text>
            </View>
            <Text style={styles.sectionText}>
              • App usage data is processed on your device{'\n'}• No data is
              sent to external servers{'\n'}• No internet connection required
              {'\n'}• No cloud storage or backups
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="eye-off" size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>No Data Collection</Text>
            </View>
            <Text style={styles.sectionText}>
              • We don't collect personal information{'\n'}• No analytics or
              tracking{'\n'}• No data sharing with third parties{'\n'}• No
              advertising or marketing data
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="lock" size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Permission Usage</Text>
            </View>
            <Text style={styles.sectionText}>
              • App usage statistics: To provide wellness insights{'\n'}•
              Notification access: To schedule task reminders{'\n'}• All
              permissions are optional and can be revoked
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="information" size={20} color="#EF4444" />
              <Text style={styles.sectionTitle}>Data Security</Text>
            </View>
            <Text style={styles.sectionText}>
              • Data is stored using Android's secure storage{'\n'}• No
              encryption keys are shared{'\n'}• Data is automatically deleted
              when app is uninstalled{'\n'}• You have complete control over your
              data
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Your privacy is our priority. We believe in transparency and
              giving you complete control over your data.
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginLeft: 28,
  },
  footer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default PrivacyInfo;
