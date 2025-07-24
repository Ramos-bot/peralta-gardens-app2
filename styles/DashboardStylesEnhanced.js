// styles/DashboardStylesEnhanced.js
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Enhanced Header Styles
  enhancedHeader: {
    paddingTop: 40,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 15,
    flex: 1,
  },
  
  // Original Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subgreeting: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: -15,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    alignItems: 'center',
    position: 'relative',
    minHeight: 90,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      ':hover': {
        transform: 'translateY(-2px)',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
      }
    }),
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.95,
    textAlign: 'center',
    fontWeight: '500',
  },
  statIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    opacity: 0.8,
  },

  // Card styles
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Quick Actions
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  actionItem: {
    alignItems: 'center',
    marginBottom: 16,
    width: (width - 100) / 4,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      ':hover': {
        transform: 'scale(1.05)',
      }
    }),
  },
  iconCircle: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease-in-out',
    }),
  },
  actionLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 14,
  },
  
  // Task Items
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      ':hover': {
        backgroundColor: '#f8f9fa',
        paddingLeft: 8,
      }
    }),
  },
  taskIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  taskTime: {
    fontSize: 13,
    color: '#666',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    marginBottom: 16,
  },
  addTaskButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addTaskText: {
    color: '#fff',
    fontWeight: '600',
  },
  
  // Tips Section
  tipText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  tipButton: {
    alignSelf: 'flex-start',
  },
  tipButtonText: {
    color: '#1976D2',
    fontWeight: '600',
  },
  
  // Notifications
  notification: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    paddingLeft: 4,
  },
});
