import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface GitHubPanelProps {
  repoName: string;
  branch: string;
  cloneUrl: string;
}

export function GitHubPanel({ repoName, branch, cloneUrl }: GitHubPanelProps) {
  const handleClone = () => {
    Linking.openURL(cloneUrl);
  };

  const handleViewOnGitHub = () => {
    Linking.openURL(cloneUrl.replace('.git', ''));
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">GitHub</ThemedText>
      <ThemedText>This project is connected to {repoName}.</ThemedText>
      <ThemedText>
        Changes will be committed to the <ThemedText type="defaultSemiBold">{branch}</ThemedText> branch.
      </ThemedText>
      
      <ThemedText style={styles.warning}>
        Your source code only exists in your GitHub repository.
        Deleting it removes your work.
      </ThemedText>

      <View style={styles.cloneSection}>
        <ThemedText type="subtitle">Clone</ThemedText>
        <View style={styles.cloneOptions}>
          <TouchableOpacity onPress={handleClone} style={styles.option}>
            <IconSymbol name="link" size={20} color="#0366d6" />
            <ThemedText>HTTPS</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleViewOnGitHub} style={styles.option}>
            <IconSymbol name="globe" size={20} color="#0366d6" />
            <ThemedText>View on GitHub</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  warning: {
    marginTop: 8,
    opacity: 0.8,
  },
  cloneSection: {
    marginTop: 16,
    gap: 8,
  },
  cloneOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
