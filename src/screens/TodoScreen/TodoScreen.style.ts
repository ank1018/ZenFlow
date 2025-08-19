import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
export const HOUR_HEIGHT = 64;
export const MINUTE_HEIGHT = HOUR_HEIGHT / 60;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  darkContainer: {
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
  },

  // Enhanced Header Styles
  header: {
    backgroundColor: '#f8fafc',
    // borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  darkHeader: {
    backgroundColor: '#1e293b',
    borderBottomColor: '#334155',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 10,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  dateDisplay: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeViewToggle: {
    backgroundColor: '#eef2ff',
  },

  // Progress Styles
  progressContainer: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366f1',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },

  // Date Navigation
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 16,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  darkDatePill: {
    backgroundColor: '#312e81',
    borderColor: '#4338ca',
  },
  datePillText: {
    color: '#1e293b',
    fontWeight: '600',
    fontSize: 14,
  },

  // Timeline Styles
  timelineContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  darkTimelineContainer: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  hourRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: HOUR_HEIGHT,
    paddingHorizontal: 12,
  },
  hourLabel: {
    position: 'absolute',
    left: 8,
    top: 4,
    width: 50,
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  darkHourLabel: {
    color: '#94a3b8',
  },
  hourLine: {
    position: 'absolute',
    left: 56,
    right: 8,
    top: HOUR_HEIGHT - 1,
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  darkHourLine: {
    backgroundColor: '#374151',
  },
  hourClickArea: {
    position: 'absolute',
    left: 56,
    right: 8,
    top: 0,
    height: HOUR_HEIGHT,
    backgroundColor: 'transparent',
  },
  timelineHint: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  timelineHintText: {
    fontSize: 10,
    color: '#6366f1',
    fontWeight: '600',
  },
  nowLine: {
    position: 'absolute',
    left: 56,
    right: 8,
    height: 2,
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  nowDot: {
    position: 'absolute',
    left: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  nowText: {
    position: 'absolute',
    right: 0,
    top: -14,
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '700',
  },
  taskTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Task Block Styles
  taskBlock: {
    position: 'absolute',
    left: 56,
    right: 12,
    borderRadius: 6,
    paddingHorizontal: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkTaskBlock: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  taskBlockContent: {
    flex: 1,
    // justifyContent: 'space-between',
    gap: 2,
  },
  taskBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  taskTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 4,
  },
  darkTaskTitle: {
    color: '#f9fafb',
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskTime: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  darkTaskTime: {
    color: '#9ca3af',
  },
  taskLocation: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 1,
  },

  // Timeline Empty State
  timelineEmptyState: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  // List View Styles
  listContainer: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  darkFilterTab: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  activeFilterTab: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  darkActiveFilterTab: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  filterTabText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  activeFilterTabText: {
    color: '#ffffff',
  },

  // Todo List Styles
  todoList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  todoItemWrapper: {
    marginBottom: 12,
  },
  todoItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  darkTodoItem: {
    backgroundColor: '#1e293b',
  },
  completedTodo: {
    opacity: 0.7,
  },
  googleTodoItem: {
    // borderLeftColor: '#4285F4',
    backgroundColor: '#f8f9ff',
  },
  todoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  todoLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  darkCheckbox: {
    backgroundColor: '#374151',
    borderColor: '#6b7280',
  },
  checkedBox: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  darkCheckedBox: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  todoTextContent: {
    flex: 1,
  },
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#64748b',
  },
  todoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  todoSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  todoDate: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
    marginBottom: 2,
  },
  todoExtras: {
    gap: 4,
  },
  todoExtraText: {
    fontSize: 12,
    color: '#64748b',
  },

  // Empty States
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },

  // Error States
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#6366f1',
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  darkFab: {
    backgroundColor: '#4f46e5',
    shadowColor: '#4f46e5',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  darkModalCard: {
    backgroundColor: '#1e293b',
  },
  editModalCard: {
    paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalRowText: {
    color: '#1e293b',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  // Form Styles
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.select({ ios: 12, android: 10 }),
    backgroundColor: '#f9fafb',
    color: '#1e293b',
    fontSize: 16,
  },
  darkInput: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
    color: '#f9fafb',
  },

  // Priority Styles
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  darkPriorityPill: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  activePriorityPill: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  darkActivePriorityPill: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  priorityPillText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14,
  },
  activePriorityPillText: {
    color: '#ffffff',
  },

  // Time Styles
  timeSection: {
    gap: 12,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
    gap: 6,
  },
  timeLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  darkTimeDisplay: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  timeText: {
    color: '#1e293b',
    fontWeight: '600',
    fontSize: 14,
  },

  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#6366f1',
  },
  saveText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },

  // Dark mode text colors
  darkText: {
    color: '#f1f5f9',
  },
  darkSubtext: {
    color: '#94a3b8',
  },

  // Scroll to Now Button
  scrollToNowButton: {
    position: 'absolute',
    bottom: 100, // Adjust as needed
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkScrollToNowButton: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  scrollToNowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },

  // Today Button
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignSelf: 'flex-start',
  },
  darkTodayButton: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  todayButtonText: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '600',
  },
  activeTodayButton: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  darkActiveTodayButton: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  activeTodayButtonText: {
    color: '#ffffff',
  },
});
