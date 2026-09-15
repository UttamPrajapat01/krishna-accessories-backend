import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { Colors } from '../theme/colors';
import { Button } from '../components/Button';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Timeless Horology',
    subtitle: 'Discover authentic Swiss & Japanese master timepieces crafted in solid gold and plasma ceramics.',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Italian Leather Goods',
    subtitle: 'Hand-burnished full grain leather briefcases, belts, and bespoke everyday essentials.',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: '18K Signature Jewellery',
    subtitle: 'Diamond-facet cufflinks and royal signet rings made for the discerning connoisseur.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
  },
];

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    if (index < slides.length - 1) {
      setIndex(index + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const current = slides[index];

  return (
    <View style={styles.container}>
      <Image source={{ uri: current.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.overlay} />

      <View style={styles.content}>
        <Text style={styles.brandBadge}>KRISHNA ACCESSORIES</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.subtitle}>{current.subtitle}</Text>

        <View style={styles.indicatorRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.indicator,
                i === index ? styles.activeIndicator : null,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonRow}>
          <Button
            title={index === slides.length - 1 ? 'Enter Boutique' : 'Next'}
            onPress={handleNext}
            style={styles.btn}
          />
          {index < slides.length - 1 && (
            <Button
              title="Skip"
              onPress={() => navigation.replace('Login')}
              variant="outline"
              style={styles.skipBtn}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  image: {
    width: '100%',
    height: '62%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 13, 0.45)',
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -30,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandBadge: {
    color: Colors.goldPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 14,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#33333E',
  },
  activeIndicator: {
    width: 24,
    backgroundColor: Colors.goldPrimary,
  },
  buttonRow: {
    width: '100%',
    gap: 10,
  },
  btn: {
    width: '100%',
  },
  skipBtn: {
    width: '100%',
  },
});
