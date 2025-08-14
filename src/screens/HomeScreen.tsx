import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();

  const menuItems = [
    {
      title: "Chat com IA",
      description: "Tire suas dúvidas de programação com o DevBot",
      icon: "chatbubbles" as any,
      route: "Chat",
    },
    {
      title: "Histórico de Conversas",
      description: "Busque e gerencie suas conversas anteriores",
      icon: "time" as any,
      route: "History",
    },
    {
      title: "Quiz de Programação",
      description: "Teste seus conhecimentos com perguntas geradas por IA",
      icon: "school" as any,
      route: "Quiz",
    },
    {
      title: "Biblioteca de Snippets",
      description: "Salve e organize seus códigos favoritos",
      icon: "library" as any,
      route: "Snippets",
    },
    {
      title: "Templates de Prompts",
      description: "Use templates predefinidos ou crie seus próprios",
      icon: "document-text" as any,
      route: "Templates",
    },
    {
      title: "Dashboard de Progresso",
      description: "Acompanhe sua evolução e estatísticas",
      icon: "stats-chart" as any,
      route: "Progress",
    },
    {
      title: "Configurações",
      description: "Configure sua API key e preferências",
      icon: "settings" as any,
      route: "Settings",
    },
  ];

  const styles = createStyles(theme);

  const handleNavigate = useCallback(
    (route: string) => {
      navigation.navigate(route);
    },
    [navigation]
  );

  const openInstagram = useCallback(() => {
    Linking.openURL("https://www.instagram.com/dennisemannuel_dev/");
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá! 👋</Text>
        <Text style={styles.title}>DevBot</Text>
        <Text style={styles.subtitle}>O que vamos construir hoje?</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollInner}
      >
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Explorar</Text>
          <View style={styles.badgeNew}>
            <Text style={styles.badgeNewText}>Novo</Text>
          </View>
        </View>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
              android_ripple={{ color: theme.primaryLight }}
              onPress={() => handleNavigate(item.route)}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={theme.textSecondary}
                />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
              <View style={styles.ctaRow}>
                <Text style={styles.ctaText}>Abrir</Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={theme.primary}
                />
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Desenvolvido por</Text>
          <Pressable style={styles.developerLink} onPress={openInstagram}>
            <Ionicons name="logo-instagram" size={16} color="#E4405F" />
            <Text style={styles.developerText}>dennisemannuel_dev</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: "transparent",
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 32,
    },
    greeting: {
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: "500",
      marginBottom: 4,
    },
    title: {
      fontSize: 34,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 6,
      letterSpacing: -1,
    },
    subtitle: {
      fontSize: 17,
      color: theme.textSecondary,
      fontWeight: "400",
      lineHeight: 24,
    },
    content: {
      flex: 1,
    },
    scrollInner: {
      paddingBottom: 48,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 24,
      marginTop: 8,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "600",
      color: theme.text,
      flex: 0,
      marginRight: 12,
    },
    badgeNew: {
      backgroundColor: theme.primaryLight,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    badgeNewText: {
      fontSize: 10,
      fontWeight: "600",
      color: theme.primary,
      letterSpacing: 0.5,
    },
    menuGrid: {
      paddingHorizontal: 24,
    },
    menuItem: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    menuItemPressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.9,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: theme.subtleBg,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    menuTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
      letterSpacing: -0.2,
    },
    menuDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    ctaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
      gap: 6,
    },
    ctaText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.primary,
    },
    footer: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 16,
      alignItems: "center",
    },
    footerText: {
      textAlign: "center",
      fontSize: 13,
      color: theme.textSecondary,
      fontWeight: "400",
      marginBottom: 8,
    },
    developerLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: theme.subtleBg,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    developerText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#E4405F",
    },
  });
