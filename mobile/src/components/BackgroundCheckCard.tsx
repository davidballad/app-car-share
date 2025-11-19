import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Chip, Icon } from 'react-native-paper';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { SPANISH_PHRASES } from '@/constants/ecuador';
import { BackgroundCheckStatus } from '@/types';

interface BackgroundCheckCardProps {
  status: BackgroundCheckStatus | null;
  onVerifyPress: () => void;
  onRenewPress: () => void;
  loading?: boolean;
}

export const BackgroundCheckCard: React.FC<BackgroundCheckCardProps> = ({
  status,
  onVerifyPress,
  onRenewPress,
  loading = false,
}) => {
  const getStatusColor = () => {
    if (!status || !status.isValid) return colors.error;
    if (status.needsRenewal) return colors.warning;
    return colors.success;
  };

  const getStatusText = () => {
    if (!status) return SPANISH_PHRASES.backgroundPending;
    if (!status.isValid) return SPANISH_PHRASES.backgroundExpired;
    if (status.needsRenewal) return `${SPANISH_PHRASES.expiresIn} ${status.daysUntilExpiry} ${SPANISH_PHRASES.days}`;
    return SPANISH_PHRASES.backgroundVerified;
  };

  const getStatusIcon = () => {
    if (!status || !status.isValid) return 'alert-circle';
    if (status.needsRenewal) return 'clock-alert';
    return 'check-circle';
  };

  const showVerifyButton = !status || !status.isValid;
  const showRenewButton = status && status.needsRenewal && status.isValid;

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Icon source={getStatusIcon()} size={24} color={getStatusColor()} />
          <Text style={[styles.title, { color: colors.onSurface }]}>
            {SPANISH_PHRASES.backgroundCheck}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Chip
            icon={getStatusIcon()}
            style={[styles.statusChip, { backgroundColor: getStatusColor() }]}
            textStyle={[styles.statusText, { color: colors.onPrimary }]}
          >
            {getStatusText()}
          </Chip>
        </View>

        {status && status.hasRecords && (
          <View style={styles.warningContainer}>
            <Icon source="alert" size={20} color={colors.warning} />
            <Text style={[styles.warningText, { color: colors.warning }]}>
              Se encontraron antecedentes en el registro
            </Text>
          </View>
        )}

        {status && status.checkDate && (
          <Text style={[styles.dateText, { color: colors.onSurfaceVariant }]}>
            Última verificación: {new Date(status.checkDate).toLocaleDateString('es-EC')}
          </Text>
        )}

        <View style={styles.buttonContainer}>
          {showVerifyButton && (
            <Button
              mode="contained"
              onPress={onVerifyPress}
              loading={loading}
              disabled={loading}
              style={[styles.button, { backgroundColor: colors.primary }]}
              labelStyle={{ color: colors.onPrimary }}
            >
              {SPANISH_PHRASES.verifyBackground}
            </Button>
          )}

          {showRenewButton && (
            <Button
              mode="outlined"
              onPress={onRenewPress}
              loading={loading}
              disabled={loading}
              style={[styles.button, { borderColor: colors.warning }]}
              labelStyle={{ color: colors.warning }}
            >
              {SPANISH_PHRASES.renewVerification}
            </Button>
          )}
        </View>

        <Text style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
          La verificación de antecedentes es requerida para usar la plataforma y debe renovarse cada 90 días.
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h4,
    marginLeft: spacing.sm,
    flex: 1,
  },
  statusContainer: {
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  statusChip: {
    borderRadius: borderRadius.round,
  },
  statusText: {
    ...typography.body2,
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  warningText: {
    ...typography.body2,
    marginLeft: spacing.sm,
    flex: 1,
  },
  dateText: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  buttonContainer: {
    marginBottom: spacing.md,
  },
  button: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  infoText: {
    ...typography.caption,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});