import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../hooks/useLocalization';
import Button from './common/Button';
import Card from './common/Card';
import Input from './common/Input';
import Badge from './common/Badge';
import { CitySelector, EcuadorPhoneInput, CedulaInput } from './ecuador';

const StyleGuide: React.FC = () => {
  const { colors, typography, spacing } = useTheme();
  const { t } = useLocalization();
  const [inputValue, setInputValue] = React.useState('');
  const [phoneValue, setPhoneValue] = React.useState('');
  const [cedulaValue, setCedulaValue] = React.useState('');
  const [selectedCity, setSelectedCity] = React.useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.section}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            🇪🇨 {t('designSystem.title')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {t('designSystem.subtitle')}
          </Text>
        </View>

        {/* Colors Section */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Colors
          </Text>
          
          {/* Primary Colors */}
          <Text style={[styles.subsectionTitle, { color: colors.text.primary }]}>
            Primary (Ecuador Blue)
          </Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorSwatch, { backgroundColor: colors.primary.blue }]}>
              <Text style={styles.colorText}>Primary</Text>
              <Text style={styles.colorCode}>#2E86AB</Text>
            </View>
            <View style={[styles.colorSwatch, { backgroundColor: colors.primary.lightBlue }]}>
              <Text style={styles.colorText}>Light</Text>
              <Text style={styles.colorCode}>#A23B72</Text>
            </View>
            <View style={[styles.colorSwatch, { backgroundColor: colors.primary.darkBlue }]}>
              <Text style={styles.colorText}>Dark</Text>
              <Text style={styles.colorCode}>#1B5E7A</Text>
            </View>
          </View>

          {/* Secondary Colors */}
          <Text style={[styles.subsectionTitle, { color: colors.text.primary }]}>
            Secondary (Ecuador Green)
          </Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorSwatch, { backgroundColor: colors.secondary.green }]}>
              <Text style={styles.colorText}>Green</Text>
              <Text style={styles.colorCode}>#28a745</Text>
            </View>
            <View style={[styles.colorSwatch, { backgroundColor: colors.secondary.lightGreen }]}>
              <Text style={styles.colorText}>Light</Text>
              <Text style={styles.colorCode}>#6BCF7F</Text>
            </View>
            <View style={[styles.colorSwatch, { backgroundColor: colors.secondary.darkGreen }]}>
              <Text style={styles.colorText}>Dark</Text>
              <Text style={styles.colorCode}>#1E7E34</Text>
            </View>
          </View>

          {/* Accent Colors */}
          <Text style={[styles.subsectionTitle, { color: colors.text.primary }]}>
            Accent (Ecuador Yellow)
          </Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorSwatch, { backgroundColor: colors.accent.yellow }]}>
              <Text style={[styles.colorText, { color: colors.text.primary }]}>Yellow</Text>
              <Text style={[styles.colorCode, { color: colors.text.primary }]}>#FFD700</Text>
            </View>
            <View style={[styles.colorSwatch, { backgroundColor: colors.whatsapp }]}>
              <Text style={styles.colorText}>WhatsApp</Text>
              <Text style={styles.colorCode}>#25D366</Text>
            </View>
          </View>
        </Card>

        {/* Typography Section */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Typography
          </Text>
          
          <Text style={[{ fontSize: typography.fontSize['5xl'], fontWeight: typography.fontWeight.bold as any, color: colors.text.primary }]}>
            Heading 1 (48px)
          </Text>
          <Text style={[{ fontSize: typography.fontSize['4xl'], fontWeight: typography.fontWeight.bold as any, color: colors.text.primary }]}>
            Heading 2 (36px)
          </Text>
          <Text style={[{ fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.semibold as any, color: colors.text.primary }]}>
            Heading 3 (30px)
          </Text>
          <Text style={[{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.semibold as any, color: colors.text.primary }]}>
            Heading 4 (24px)
          </Text>
          <Text style={[{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.medium as any, color: colors.text.primary }]}>
            Heading 5 (20px)
          </Text>
          <Text style={[{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.medium as any, color: colors.text.primary }]}>
            Heading 6 (18px)
          </Text>
          <Text style={[{ fontSize: typography.fontSize.base, color: colors.text.primary }]}>
            Body text (16px) - This is the default body text size used throughout the application.
          </Text>
          <Text style={[{ fontSize: typography.fontSize.sm, color: colors.text.secondary }]}>
            Small text (14px) - Used for captions and secondary information.
          </Text>
          <Text style={[{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }]}>
            Extra small text (12px) - Used for labels and fine print.
          </Text>
        </Card>

        {/* Buttons Section */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Buttons
          </Text>
          
          <View style={styles.buttonRow}>
            <Button title="Primary" onPress={() => {}} variant="primary" />
            <Button title="Secondary" onPress={() => {}} variant="secondary" />
          </View>
          
          <View style={styles.buttonRow}>
            <Button title="Outline" onPress={() => {}} variant="outline" />
            <Button title="WhatsApp" onPress={() => {}} variant="whatsapp" />
          </View>
          
          <View style={styles.buttonRow}>
            <Button title="Danger" onPress={() => {}} variant="danger" />
            <Button title="Loading" onPress={() => {}} loading />
          </View>

          <Text style={[styles.subsectionTitle, { color: colors.text.primary }]}>
            Button Sizes
          </Text>
          <View style={styles.buttonColumn}>
            <Button title="Large Button" onPress={() => {}} size="large" />
            <Button title="Medium Button" onPress={() => {}} size="medium" />
            <Button title="Small Button" onPress={() => {}} size="small" />
          </View>
        </Card>

        {/* Badges Section */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Badges
          </Text>
          
          <View style={styles.badgeRow}>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
          </View>
          
          <View style={styles.badgeRow}>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
          </View>

          <Text style={[styles.subsectionTitle, { color: colors.text.primary }]}>
            Verification Badges
          </Text>
          <View style={styles.badgeRow}>
            <Badge variant="verified">✓ Verified</Badge>
            <Badge variant="pending">⏳ Pending</Badge>
            <Badge variant="rejected">✗ Rejected</Badge>
          </View>

          <Text style={[styles.subsectionTitle, { color: colors.text.primary }]}>
            Badge Sizes
          </Text>
          <View style={styles.badgeRow}>
            <Badge size="small">Small</Badge>
            <Badge size="medium">Medium</Badge>
            <Badge size="large">Large</Badge>
          </View>
        </Card>

        {/* Inputs Section */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Form Inputs
          </Text>
          
          <Input
            label="Standard Input"
            placeholder="Enter your text here"
            value={inputValue}
            onChangeText={setInputValue}
          />
          
          <Input
            label="Email Input"
            placeholder="your@email.com"
            value=""
            onChangeText={() => {}}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Input
            label="Password Input"
            placeholder="Enter password"
            value=""
            onChangeText={() => {}}
            secureTextEntry
            showPasswordToggle
          />
          
          <Input
            label="Phone Input"
            placeholder="0987654321"
            value=""
            onChangeText={() => {}}
            keyboardType="phone-pad"
          />
          
          <Input
            label="Input with Error"
            placeholder="This field has an error"
            value=""
            onChangeText={() => {}}
            error="This field is required"
          />
          
          <Input
            label="Disabled Input"
            placeholder="This input is disabled"
            value="Disabled value"
            onChangeText={() => {}}
            disabled
          />
        </Card>

        {/* Cards Section */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Cards
          </Text>
          
          <Text style={[styles.subsectionTitle, { color: colors.text.primary }]}>
            Card Variations
          </Text>
          
          <Card padding="small" style={styles.cardExample}>
            <Text style={{ color: colors.text.primary }}>Small Padding Card</Text>
          </Card>
          
          <Card padding="medium" style={styles.cardExample}>
            <Text style={{ color: colors.text.primary }}>Medium Padding Card (Default)</Text>
          </Card>
          
          <Card padding="large" style={styles.cardExample}>
            <Text style={{ color: colors.text.primary }}>Large Padding Card</Text>
          </Card>

          <Text style={[styles.subsectionTitle, { color: colors.text.primary }]}>
            Shadow Variations
          </Text>
          
          <Card shadow="small" style={styles.cardExample}>
            <Text style={{ color: colors.text.primary }}>Small Shadow</Text>
          </Card>
          
          <Card shadow="medium" style={styles.cardExample}>
            <Text style={{ color: colors.text.primary }}>Medium Shadow (Default)</Text>
          </Card>
          
          <Card shadow="large" style={styles.cardExample}>
            <Text style={{ color: colors.text.primary }}>Large Shadow</Text>
          </Card>
        </Card>

        {/* Ecuador-Specific Components */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            🇪🇨 Componentes Específicos de Ecuador
          </Text>
          
          <Text style={[styles.subsectionTitle, { color: colors.text.primary }]}>
            Selector de Ciudades
          </Text>
          <CitySelector
            value={selectedCity}
            onSelect={setSelectedCity}
            label="Ciudad"
            placeholder="Selecciona una ciudad ecuatoriana"
          />
          
          <Text style={[styles.subsectionTitle, { color: colors.text.primary }]}>
            Teléfono Ecuador
          </Text>
          <EcuadorPhoneInput
            value={phoneValue}
            onChangeText={setPhoneValue}
            label="Número de Teléfono"
          />
          
          <Text style={[styles.subsectionTitle, { color: colors.text.primary }]}>
            Cédula de Identidad
          </Text>
          <CedulaInput
            value={cedulaValue}
            onChangeText={setCedulaValue}
            label="Cédula de Identidad"
          />
        </Card>

        {/* Ecuador Theme Info */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            🇪🇨 {t('designSystem.themeInfo')}
          </Text>
          
          <Text style={[styles.bodyText, { color: colors.text.primary }]}>
            {t('designSystem.themeDescription')}
          </Text>
          
          <View style={styles.infoList}>
            <Text style={[styles.infoItem, { color: colors.text.primary }]}>
              🔵 <Text style={{ fontWeight: typography.fontWeight.semibold as any }}>Azul</Text> - {t('designSystem.blueDescription')}
            </Text>
            <Text style={[styles.infoItem, { color: colors.text.primary }]}>
              🟢 <Text style={{ fontWeight: typography.fontWeight.semibold as any }}>Verde</Text> - {t('designSystem.greenDescription')}
            </Text>
            <Text style={[styles.infoItem, { color: colors.text.primary }]}>
              🟡 <Text style={{ fontWeight: typography.fontWeight.semibold as any }}>Amarillo</Text> - {t('designSystem.yellowDescription')}
            </Text>
            <Text style={[styles.infoItem, { color: colors.text.primary }]}>
              💚 <Text style={{ fontWeight: typography.fontWeight.semibold as any }}>Verde WhatsApp</Text> - {t('designSystem.whatsappDescription')}
            </Text>
          </View>
          
          <Text style={[styles.bodyText, { color: colors.text.secondary, marginTop: spacing[4] }]}>
            {t('designSystem.accessibilityNote')}
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  colorSwatch: {
    flex: 1,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  colorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  colorCode: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.9,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  buttonColumn: {
    gap: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  cardExample: {
    marginBottom: 12,
  },
  infoList: {
    marginTop: 12,
  },
  infoItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
});

export default StyleGuide;