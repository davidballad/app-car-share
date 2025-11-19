import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocalization } from '../../hooks/useLocalization';
import { Card, Badge, Button, Avatar, Divider } from '../../components/common';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { colors, spacing } = useTheme();
  const { t } = useLocalization();
  const navigation = useNavigation();

  const handleLogout = () => {
    logout();
  };

  const verificationBadges = [
    { label: t('profile.verification.phone'), verified: true },
    { label: t('profile.verification.identity'), verified: false },
    { label: t('profile.verification.background'), verified: false },
    { label: t('profile.verification.license'), verified: false },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('profile.title')}</Text>
        
        {user && (
          <Card style={{ marginBottom: spacing[5] }}>
            <View style={styles.userHeader}>
              <Avatar 
                name={`${user.firstName} ${user.lastName}`}
                size="large"
              />
              <View style={styles.userDetails}>
                <Text style={[styles.name, { color: colors.text.primary }]}>
                  {user.firstName} {user.lastName}
                </Text>
                <Text style={[styles.email, { color: colors.text.secondary }]}>{user.email}</Text>
                <Text style={[styles.phone, { color: colors.text.secondary }]}>{user.phone}</Text>
              </View>
            </View>
            
            <Divider style={{ marginVertical: spacing[4] }} />
            
            <View style={styles.verificationSection}>
              <Text style={[styles.verificationTitle, { color: colors.text.primary }]}>
                {t('profile.verificationStatus')}
              </Text>
              <View style={styles.badgesContainer}>
                {verificationBadges.map((badge, index) => (
                  <Badge
                    key={index}
                    variant={badge.verified ? 'verified' : 'pending'}
                    size="small"
                  >
                    {badge.verified ? '✅' : '⏳'} {badge.label}
                  </Badge>
                ))}
              </View>
            </View>
          </Card>
        )}

        <Card style={{ marginBottom: spacing[5] }}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={[styles.menuText, { color: colors.text.primary }]}>{t('profile.editProfile')}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <Divider />
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={[styles.menuText, { color: colors.text.primary }]}>{t('profile.verificationStatus')}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <Divider />
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={[styles.menuText, { color: colors.text.primary }]}>{t('profile.uploadDocuments')}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <Divider />
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={[styles.menuText, { color: colors.text.primary }]}>{t('profile.backgroundCheck')}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Development: Design System Link */}
        <Card style={{ marginBottom: spacing[5] }}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('DesignSystem' as never)}
          >
            <Text style={[styles.menuText, { color: colors.primary.blue }]}>🎨 Ver Sistema de Diseño</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </Card>

        <Button 
          title={t('auth.logout')} 
          onPress={handleLogout}
          variant="danger"
          fullWidth
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E86AB',
    marginBottom: 20,
    textAlign: 'center',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 2,
  },
  phone: {
    fontSize: 16,
  },
  verificationSection: {
    marginTop: 0,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuText: {
    fontSize: 16,
  },
  menuArrow: {
    fontSize: 20,
    color: '#ccc',
  },
});

export default ProfileScreen;